import "./Home.css"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Login from "../../components/Login/Login"
import Signup from "../../components/Signup/Signup"
import Logo from "../../assets/homepage/logo.png"
import Icon1 from "../../assets/homepage/ctp-icon1.png"
import Icon2 from "../../assets/homepage/ctp-icon2.png"
import Icon3 from "../../assets/homepage/ctp-icon3.png"


const MODAL_VIEWS = {
  LOGIN: 'LOGIN',
  SIGN_UP: 'SIGN_UP',
  NONE: null,
};

type ModalView = 'LOGIN' | 'SIGN_UP' | null;

function Home () {
    const navigate = useNavigate();
    
    const [toggleSearch, setToggleSearch] = useState(true);
    const [inputValue, setInputValue] = useState('');

    const [activeModalView, setActiveModalView] = useState<ModalView>(null); 
    const openLoginModal = () => setActiveModalView('LOGIN')
    const openSignUpModal = () => setActiveModalView('SIGN_UP');

    const closeModal = () => setActiveModalView(MODAL_VIEWS.NONE);
    const renderModal = () => {
        if (activeModalView === MODAL_VIEWS.LOGIN) {
            // Pass closeModal to the LoginScreen
            return <Login onClose={closeModal} onSwitchToSignUp={openSignUpModal}/>; 
        }
        if (activeModalView === MODAL_VIEWS.SIGN_UP) {
            // Pass closeModal to the SignUpScreen
            return <Signup onClose={closeModal} onSwitchToLogin={openLoginModal} />; 
        }
        return null;
    };

    const toggleSearchParam = () => {
        setToggleSearch(!toggleSearch);
    }
    const handleKeyPress = (event : React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            // When Enter is pressed, navigate to the path
            if (toggleSearch){
                navigate(`/results/server/`);
            } else {
                navigate(`/results/player/`);
            }
        }
    };
    return (
        <>
            {renderModal()}

            <section className="home-header">
                <div className="account-buttons">
                    <button className="sign-up" onClick={openSignUpModal}>Sign Up</button>
                    <button className="log-in" onClick={openLoginModal}>Log In</button>
                </div>
            </section>
            <section className="home-body">
                <img className="logo" src={Logo} />

                {toggleSearch ? <h1>Enter your <strong>server</strong> to get started</h1> : <h1>Find a player</h1>}
                {toggleSearch ? <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress} placeholder="Your server" /> : <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress} placeholder="Player name" /> }
                {toggleSearch ? <button onClick={toggleSearchParam}>I'd like to look up a player by name</button> : <button onClick={toggleSearchParam}>I want to find a player in a server</button>}
            </section>
            <section className="home-more-info">
                <h1>Join the Family</h1>
                <h3>Love Rate My Warrior-Of-Light? Become a user.</h3>
                <div className='icon-container'>
                    <div className='icon'>
                        <img src={Icon1}/>
                        <p>Manage and edit your ratings</p>
                    </div>
                    <div className='icon'>
                        <img src={Icon2}/>
                        <p>Your ratings are always anonymous</p>

                    </div>
                    <div className='icon'>
                        <img src={Icon3}/>
                        <p>Like or dislike ratings</p>
                    </div>

                    
                </div>
                <button className='black-rounded-btn'>Sign up now!</button>
            </section>
            <section className='footer'>

            </section>
        </>
    )
}

export default Home;