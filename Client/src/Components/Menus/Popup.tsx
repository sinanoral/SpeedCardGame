import styled from 'styled-components'
import { HiOutlineChevronLeft, HiOutlineHome } from 'react-icons/hi'

interface Props {
	children: JSX.Element | JSX.Element[]
	onBackButton?: () => void | undefined
	onHomeButton?: () => void | undefined
}

const Popup = ({ children, onBackButton, onHomeButton }: Props) => {
	return (
		<PopupContainer>
			<PopupCenter>
				{!!onBackButton && <BackButton onClick={onBackButton} />}
				{!!onHomeButton && <HomeButton onClick={onHomeButton} />}
				{children}
			</PopupCenter>
		</PopupContainer>
	)
}

const BackButton = styled(HiOutlineChevronLeft)`
	position: absolute;
	top: 0;
	left: 0;
	padding: 20px;
	width: 25px;
	height: 25px;
	color: white;
	cursor: pointer;

	&:hover {
		color: #bebebe;
	}
`

const HomeButton = styled(HiOutlineHome)`
	position: absolute;
	top: 0;
	left: 0;
	padding: 20px;
	width: 25px;
	height: 25px;
	color: white;
	cursor: pointer;

	&:hover {
		color: #bebebe;
	}
`

const PopupCenter = styled.div`
	position: absolute;
	background-color: #2e2e2e;
	border-radius: 12px;
	color: whitesmoke;
	padding: 50px;
`

const PopupContainer = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	background: rgba(0, 0, 0, 0.2);
	z-index: 60;
	backdrop-filter: blur(3px);
`

export default Popup
