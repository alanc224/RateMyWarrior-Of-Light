import "./Home.css"
import { useState } from 'react'
function Home () {
    const [toggleSearch, setToggleSearch] = useState(true)
    const toggleSearchParam = () => {
        setToggleSearch(!toggleSearch);
    }
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
                {toggleSearch ? <input type="text" placeholder="Your server" /> : <input type="text" placeholder="Player name" /> }
                {toggleSearch ? <button onClick={toggleSearchParam}>I want to find a player in a server</button> : <button onClick={toggleSearchParam}>I'd like to look up a player by name</button>}
            </section>
        </>
    )
}

export default Home;