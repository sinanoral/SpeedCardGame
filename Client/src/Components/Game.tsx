import * as signalR from '@microsoft/signalr'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { IGameState } from '../Interfaces/IGameState'
import {CardLocationType, ICard, IPos, IRenderableCard} from '../Interfaces/ICard'
import styled from 'styled-components'
import Player from './Player'
import GameBoardLayout from '../Helpers/GameBoardLayout'
import Card from './Card'
import {LayoutGroup, PanInfo } from 'framer-motion'
import { GetDistanceRect } from '../Helpers/Distance'

interface Props {
	connection: signalR.HubConnection | undefined
	connectionId: string | undefined | null
	roomId: string | undefined
	gameState: IGameState
}

interface BoardDimensions {
	connection: signalR.HubConnection | undefined
	connectionId: string | undefined | null
	roomId: string | undefined
	gameState: IGameState
}

// Clamp number between two values with the following line:
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

const Game = ({ connection, connectionId, gameState, roomId }: Props) => {
	const [movedCards, setMovedCards] = useState<IMovedCardPos[]>([])
	const [renderableCards, setRenderableCards] = useState<IRenderableCard[]>([] as IRenderableCard[])
	const [gameBoardDimensions, setGameBoardDimensions] = useState<IPos>({ x: 600, y: 700 })
	const [draggingCard, setDraggingCard] = useState<IRenderableCard>()

	useLayoutEffect(() => {
		function UpdateGameBoardDimensions() {
			setGameBoardDimensions({
				x: clamp(window.innerWidth, 0, GameBoardLayout.maxWidth),
				y: window.innerHeight,
			} as IPos)
		}

		UpdateGameBoardDimensions()
		window.addEventListener('resize', UpdateGameBoardDimensions)
		return () => window.removeEventListener('resize', UpdateGameBoardDimensions)
	}, [])

	useEffect(() => {
		UpdateRenderableCards()
	}, [gameBoardDimensions])

	useEffect(() => {
		if (!connection) return
		connection.on('CardMoved', CardMoved)

		return () => {
			connection.off('CardMoved', CardMoved)
		}
	}, [connection])

	useEffect(() => {
		UpdateRenderableCards()
	}, [gameState])

	const CardMoved = (data: any) => {
		let parsedData: IMovedCardPos = JSON.parse(data)

		let existingMovingCard = movedCards.find((c) => c.cardId === parsedData.cardId)
		if (existingMovingCard) {
			existingMovingCard.pos = parsedData.pos
		} else {
			movedCards.push(parsedData)
		}
		setMovedCards([...movedCards])
		UpdateRenderableCards()
	}

	const getPosPixels = (pos: IPos): IPos => {
		return {
			x: pos!! ? pos.x * gameBoardDimensions.x : 0,
			y: pos!! ? pos.y * gameBoardDimensions.y : 0,
		}
	}

	const UpdateRenderableCards = () => {
		// let ourId = connectionId ?? 'CUqUsFYm1zVoW-WcGr6sUQ'
		let ourId = connectionId
		let newRenderableCards = [] as IRenderableCard[]

		// Add players cards
		gameState.Players.map((p, i) => {
			let ourPlayer = p.Id == ourId

			// Add the players hand cards
			let handCardPositions = GameBoardLayout.GetHandCardPositions(i)
			let handCards = p.HandCards.map((hc, cIndex) => {
				// We only want to override the position of cards that aren't ours
				let movedCard = ourPlayer ? null : movedCards.find((c) => c.cardId === hc.Id)
				let zIndex = cIndex + 5
				if (!ourPlayer) {
					zIndex = Math.abs(cIndex - 4)
				}
				return {...{
					...hc,
					ourCard: ourPlayer,
					location: CardLocationType.Hand,
					pos: getPosPixels(movedCard?.pos ?? handCardPositions[cIndex]),
					zIndex: zIndex,
					ref: renderableCards.find((c) => c.Id === hc.Id)?.ref ?? React.createRef<HTMLDivElement>(),
				}} as IRenderableCard
			})
			newRenderableCards.push(...handCards)

			// Add the players Kitty card
			let movedCard = ourPlayer ? null : movedCards.find((c) => c.cardId === p.TopKittyCardId)
			let kittyCardPosition = GameBoardLayout.GetKittyCardPosition(i)
			let kittyCard = {...{
				Id: p.TopKittyCardId,
				ourCard: ourPlayer,
				location: CardLocationType.Kitty,
				pos: getPosPixels(movedCard?.pos ?? kittyCardPosition),
				zIndex: ourPlayer ? 10 : 5,
				ref: renderableCards.find((c) => c.Id === p.TopKittyCardId)?.ref ?? React.createRef<HTMLDivElement>(),
			}} as IRenderableCard
			newRenderableCards.push(kittyCard)
		})

		// Add the center piles
		let centerCardPositions = GameBoardLayout.GetCenterCardPositions()
		let centerPiles = gameState.CenterPiles.map((cp, cpIndex) => {
			return {...{
				...cp,
				location: CardLocationType.Center,
				pos: getPosPixels(centerCardPositions[cpIndex]),
				ref: renderableCards.find((c) => c.Id === cp.Id)?.ref ?? React.createRef<HTMLDivElement>(),
				ourCard: false,
			}} as IRenderableCard
		})
		newRenderableCards.push(...centerPiles)
		setRenderableCards(newRenderableCards)
	}

	const OnStartDrag = (panInfo: PanInfo, card: IRenderableCard) => {
		setDraggingCard({ ...card })
	}

	const OnDrag = (panInfo: PanInfo, card: IRenderableCard) => {
		setDraggingCard({ ...card })
	}

	const OnEndDrag = (panInfo: PanInfo, topCard: IRenderableCard) => {
		let ourPlayer = gameState.Players.find((p) => p.Id === connectionId)

		// Get the bottom card
		let cardDistances = renderableCards.map((c) => {
			return {
				card: c,
				distance: GetDistanceRect(
					draggingCard?.ref.current?.getBoundingClientRect(),
					c.ref.current?.getBoundingClientRect()
				),
			}
		})
		cardDistances = cardDistances.sort((a, b) => a.distance - b.distance)
		let bottomCard = cardDistances[1].card

		// We are trying to play a card into the center
		if (topCard.location === CardLocationType.Hand && bottomCard.location === CardLocationType.Center) {
			console.log('Attempt play', topCard)
			let centerPileCard = gameState.CenterPiles.find(c=>c.Id === bottomCard.Id)
			if(!centerPileCard) return
			let centerPileId = gameState.CenterPiles.indexOf(centerPileCard)
			if(centerPileId === -1) return
			connection?.invoke('TryPlayCard', topCard.Id, centerPileId).catch((e)=>console.log(e));
		}

		// We are trying to pickup a card from the kitty
		if (
			topCard.location === CardLocationType.Kitty &&
			bottomCard.location === CardLocationType.Hand &&
			bottomCard.ourCard
		) {
			console.log('Attempt pickup from kitty', topCard)
		}
		setDraggingCard(undefined)
	}

	return (
		<Board>
			<Player key={`player-${gameState.Players[0].Id}`} player={gameState.Players[0]} />
			{renderableCards.map((c) => (
				<Card
					card={c}
					onDragStart={OnStartDrag}
					onDrag={OnDrag}
					onDragEnd={OnEndDrag}
					draggingCard={draggingCard}
				/>
			))}
			<Player key={`player-${gameState.Players[1].Id}`} player={gameState.Players[1]} />
		</Board>
	)
}

const Board = styled.div`
	margin-top: 100px;
	position: relative;
	background-color: #729bf5;
	width: 100%;
	height: 100%;
	max-width: ${GameBoardLayout.maxWidth}px;
	user-select: none;
`

export interface IMovedCardPos {
	cardId: number
	pos: IPos
}

export default Game
