import "./Home.css"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Logo from "../../assets/homepage/logo.png"
import Icon1 from "../../assets/homepage/ctp-icon1.png"
import Icon2 from "../../assets/homepage/ctp-icon2.png"
import Icon3 from "../../assets/homepage/ctp-icon3.png"


interface HomeProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

function Home ({onLoginClick, onSignUpClick}: HomeProps) {
    const navigate = useNavigate();
    
    const [inputValue, setInputValue] = useState('');

    const handleKeyPress = (event : React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            // When Enter is pressed, navigate to the path
           
            navigate(`/results/player/${inputValue}`);
            
        }
    };
    return (
        <>
            <section className="home-header">
                <div className="account-buttons">
                    <button className="sign-up" onClick={onSignUpClick}>Sign Up</button>
                    <button className="log-in" onClick={onLoginClick}>Log In</button>
                </div>
            </section>
            <section className="home-body">
                <img className="logo" src={Logo} />

                <h1>Enter a player name</h1>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress} placeholder="Player name" /> 
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
                <button className='black-rounded-btn' onClick={onSignUpClick}>Sign up now!</button>
            </section>
            <section className='footer'>

            </section>
        </>
    )
}

export default Home;