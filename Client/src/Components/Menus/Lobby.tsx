import * as signalR from '@microsoft/signalr'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { GameType, ILobby, IPlayerConnection } from '../../Interfaces/ILobby'
import styled from 'styled-components'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi'
import Popup from '../Popup'
import { IGameState } from '../../Interfaces/IGameState'
import { AnimatePresence, motion } from 'framer-motion'
import LobbyPlayer from './LobbyPlayer'

interface Props {
	connection: signalR.HubConnection | undefined
	roomId: string | undefined
	gameState: IGameState | undefined
	onBack: () => void
}

const Lobby = ({ connection, roomId, gameState, onBack }: Props) => {
	let navigate = useNavigate()
	const [lobbyData, setLobbyData] = useState<ILobby>()
	const [myPlayerName, setMyPlayerName] = useState<string>(() =>
		JSON.parse(localStorage.getItem('playerName') ?? '{playerName: Player}')
	)
	const [searchParams, setSearchParams] = useSearchParams()
	const [waitingForPlayers, setWaitingForPlayers] = useState(true)
	const [activePlayers, setActivePlayers] = useState<string[]>([])
	const [spectating, setSpectating] = useState<boolean>(false)

	useEffect(() => {
		if (!connection) return
		connection.on('UpdateLobbyState', UpdateLobbyData)

		return () => {
			connection.off('UpdateLobbyState', UpdateLobbyData)
		}
	}, [connection])

	useEffect(() => {
		let activePlayers = (gameState?.Players.filter((p) => p.Id !== '0') ?? []).map((p) => p.Id)
		setActivePlayers(activePlayers)
		setSpectating(activePlayers.length >= 2 && !activePlayers.find((p) => p === connection?.connectionId))
	}, [gameState])

	const UpdateLobbyData = (data: any) => {
		let lobbyData: ILobby = JSON.parse(data)
		setLobbyData(lobbyData)
		let myPlayerInfo = lobbyData.Connections.find((c) => c.ConnectionId === connection?.connectionId)

		let inputGameType = searchParams.get('type') as GameType
		if (!!inputGameType && !lobbyData.GameStarted && !lobbyData.IsBotGame && inputGameType === 'bot') {
			let inputDifficulty = searchParams.get('difficulty')
			let botDifficulty = !!inputDifficulty ? +inputDifficulty : 0
			onStartGame(true, botDifficulty)
		}
	}

	useEffect(() => {
		setWaitingForPlayers(lobbyData == null || lobbyData.Connections?.length < 2)
	}, [lobbyData])

	const onStartGame = (botGame: boolean = false, botDifficulty: number = 0) => {
		connection?.invoke('StartGame', botGame, botDifficulty)
	}

	const UpdateName = (newName: string) => {
		// Save it to local storage
		localStorage.setItem('playerName', JSON.stringify(newName))

		// Update our name on the server
		connection?.invoke('UpdateName', newName)

		// Locally set our name
		setMyPlayerName(newName)
	}

	const ShowLobby = () => {
		return !gameState || !connection || activePlayers.length < 2 || spectating || !lobbyData?.GameStarted
	}

	if (!ShowLobby()) {
		return <></>
	}
	return (
		<Popup
			id={'lobbyPopup'}
			onBackButton={() => {
				onBack()
				navigate(`/`)
			}}
		>
			<LobbyWrapper>
				<Header2>Lobby</Header2>
				<Group>
					<GameCodeTitle>Game Code:</GameCodeTitle>
					<GameCodeWrapper>
						<input value={roomId} disabled={true} />
						<CopyButton onClick={() => navigator.clipboard.writeText(window.location.href)} />
					</GameCodeWrapper>
				</Group>
				<Group>
					<PlayersTitle>Players:</PlayersTitle>
					<PlayersContainer>
						{lobbyData != null && !!connection?.connectionId ? (
							<>
								{lobbyData?.Connections?.map((p, i) =>
									LobbyPlayer(connection?.connectionId as string, myPlayerName, p, UpdateName, i)
								)}
							</>
						) : (
							<div>Connecting to room..</div>
						)}
					</PlayersContainer>
				</Group>
				{waitingForPlayers && !!lobbyData && (
					<p style={{ marginTop: -10, height: 0 }}>Waiting for another player to join..</p>
				)}
				{spectating ? (
					<p>Game in progress</p>
				) : (
					lobbyData != null &&
					!!connection?.connectionId && (
						<StartButton disabled={waitingForPlayers} onClick={() => onStartGame()}>
							Start Game
						</StartButton>
					)
				)}
			</LobbyWrapper>
		</Popup>
	)
}

export default Lobby

const LobbyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

const StartButton = styled.button`
	margin-top: 20px;
`

const Group = styled.div`
	width: 175px;
	display: flex;
	flex-direction: column;
	margin-bottom: 30px;
	align-items: flex-start;
`

const PlayersTitle = styled.p`
	margin-bottom: 8px;
`
const PlayersContainer = styled.div`
	justify-content: flex-start;
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
	min-height: 65px;
`

const GameCodeTitle = styled.p`
	margin-bottom: 5px;
`

const GameCodeWrapper = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
`

const CopyButton = styled(HiOutlineDocumentDuplicate)`
	width: 25px;
	height: 25px;
	color: white;
	cursor: pointer;

	&:hover {
		color: #bebebe;
	}
`

const Header2 = styled.h2`
	width: 250px;
	margin-bottom: 0px;
`
