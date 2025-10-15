import "./Header.css"
import Logo from "../../assets/header/rmw-logo.png"
import { useNavigate } from 'react-router-dom'
interface HeaderProps {
  playerName: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({playerName, onChange, handleKeyPress, onLoginClick, onSignUpClick}) => {
    const navigate = useNavigate()
    return (
        <>
            <div className="header">
                <img className='header-img' src={Logo} onClick={() => navigate('/')} />
                <input className='header-input' placeholder="Player name" value={playerName} onChange={onChange} onKeyDown={handleKeyPress}></input>
                <div className='header-buttons-container'>
                    <button className="header-account-btns" onClick={onLoginClick}>Log In</button>
                    <button className="header-account-btns header-account-outline" onClick={onSignUpClick}>Sign Up</button>

                </div>
            </div>
        </>
    )
}

export default Header;