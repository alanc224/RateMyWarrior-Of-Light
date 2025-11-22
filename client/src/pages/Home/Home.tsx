import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext"; // Use useAuth here
import Logo from "../../assets/homepage/logo.png";
import Icon1 from "../../assets/homepage/ctp-icon1.png";
import Icon2 from "../../assets/homepage/ctp-icon2.png";
import Icon3 from "../../assets/homepage/ctp-icon3.png";
import "./Home.css"

function Home() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const { isAuthenticated, playerName, setModalView, logout } = useAuth();

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      navigate(`/results/player/${inputValue}`);
    }
  };

  return (
    <>
      <section className="home-header">
        <div className="account-buttons">
          {!isAuthenticated ? (
            <>
              <button className="sign-up" onClick={() => setModalView('SIGN_UP')}>Sign Up</button>
              <button className="log-in" onClick={() => setModalView('LOGIN')}>Log In</button>
            </>
          ) : (
            <>
              <button className="sign-up" onClick={logout}>Log Out</button>
            </>
          )}
        </div>
      </section>
      <section className="home-body">
        <img className="logo" src={Logo} alt="logo" />
        <h1>Enter a player name</h1>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Player name"
        />
      </section>
      <section className="home-more-info">
        <h1>Join the Family</h1>
        <h3>Love Rate My Warrior-Of-Light? Become a user.</h3>
        <div className="icon-container">
          <div className="icon">
            <img src={Icon1} alt="icon 1" />
            <p>Manage and edit your ratings</p>
          </div>
          <div className="icon">
            <img src={Icon2} alt="icon 2" />
            <p>Your ratings are always anonymous</p>
          </div>
          <div className="icon">
            <img src={Icon3} alt="icon 3" />
            <p>Like or dislike ratings</p>
          </div>
        </div>
        <button className="black-rounded-btn" onClick={() => setModalView('SIGN_UP')}>Sign up now!</button>
      </section>
    </>
  );
}

export default Home;
