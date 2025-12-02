import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";
import WorldSelector from "../../components/WorldSelector/WorldSelector";
import Logo from "../../assets/homepage/logo.png";
import Icon1 from "../../assets/homepage/ctp-icon1.png";
import Icon2 from "../../assets/homepage/ctp-icon2.png";
import Icon3 from "../../assets/homepage/ctp-icon3.png";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [selectedWorld, setSelectedWorld] = useState("");
  const [characterName, setCharacterName] = useState("");
  const { isAuthenticated, setModalView, logout } = useAuth();

  const handleSearch = () => {
    if (!selectedWorld) {
      alert("Please select a world first");
      return;
    }
    if (!characterName.trim()) {
      alert("Please enter a character name");
      return;
    }
    navigate(`/results/player/${selectedWorld}/${characterName}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <section className="home-header">
        <div className="account-buttons">
          {!isAuthenticated ? (
            <>
              <button className="sign-up" onClick={() => setModalView("SIGN_UP")}>
                Sign Up
              </button>
              <button className="log-in" onClick={() => setModalView("LOGIN")}>
                Log In
              </button>
            </>
          ) : (
            <>
              <button className="sign-up" onClick={logout}>
                Log Out
              </button>
            </>
          )}
        </div>
      </section>

      <section className="home-body">
        <img className="logo" src={Logo} alt="logo" />

        <h1>Search for a Player</h1>

        {/* Step 1: Select World */}
        <div className="search-step">
          <label className="search-label">Select World</label>
          <WorldSelector
            value={selectedWorld}
            onChange={setSelectedWorld}
            placeholder="Select realm and world..."
          />
        </div>

        {/* Step 2: Enter Character Name */}
        <div className="search-step">
          <label className="search-label">Enter Character Name</label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              selectedWorld ? "Enter character name..." : "Select a world first"
            }
            className="character-input"
            disabled={!selectedWorld}
          />
        </div>

        {/* Search Button */}
        <button
          className="search-button"
          onClick={handleSearch}
          disabled={!selectedWorld || !characterName.trim()}
        >
          Search Player
        </button>

        {(!selectedWorld || !characterName.trim()) && (
          <p className="search-hint">
            {!selectedWorld
              ? "Select a world to continue"
              : "Enter a character name to search"}
          </p>
        )}
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
        <button
          className="black-rounded-btn"
          onClick={() => setModalView("SIGN_UP")}
        >
          Sign up now!
        </button>
      </section>

      <section className="footer"></section>
    </>
  );
}

export default Home;