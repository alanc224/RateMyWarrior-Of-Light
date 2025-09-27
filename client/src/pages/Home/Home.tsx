import "./Home.css"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
function Home () {
    const navigate = useNavigate();
    
    const [toggleSearch, setToggleSearch] = useState(true);
    const [inputValue, setInputValue] = useState('');

    const toggleSearchParam = () => {
        setToggleSearch(!toggleSearch);
    }
    const handleKeyPress = (event : React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            // When Enter is pressed, navigate to the path
            if (toggleSearch){
                navigate(`/results/server/${inputValue}`);
            } else {
                navigate(`/results/player/${inputValue}`);
            }
        }
    };
    return (
        <>
            <section className="home-header">
                <div className="account-buttons">
                    <button className="sign-up">Sign Up</button>
                    <button className="log-in">Log In</button>
                </div>
            </section>
            <section className="home-body">
                <i>Replace with Logo</i>

                {toggleSearch ? <h1>Enter your <strong>server</strong> to get started</h1> : <h1>Find a player</h1>}
                {toggleSearch ? <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress} placeholder="Your server" /> : <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress} placeholder="Player name" /> }
                {toggleSearch ? <button onClick={toggleSearchParam}>I want to find a player in a server</button> : <button onClick={toggleSearchParam}>I'd like to look up a player by name</button>}
            </section>
        </>
    )
}

export default Home;