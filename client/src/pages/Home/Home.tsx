import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react"; 
import WorldSelector from "../../components/WorldSelector/WorldSelector";
import Logo from "../../assets/homepage/logo.png";
import Icon1 from "../../assets/homepage/ctp-icon1.png";
import Icon2 from "../../assets/homepage/ctp-icon2.png";
import Icon3 from "../../assets/homepage/ctp-icon3.png";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedWorld, setSelectedWorld] = useState("");
  const [characterName, setCharacterName] = useState("");

  const { openSignUp, openSignIn, signOut} = useClerk();

  useEffect(() => {
    if (location.state?.showLogin) {
      openSignIn();
      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, openSignIn, navigate]);

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
        <div className="account-buttons" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          <SignedOut>
            <button className="sign-up" onClick={() => openSignUp()}>
              Sign Up
            </button>
            <button className="log-in" onClick={() => openSignIn()}>
              Log In
            </button>
          </SignedOut>

          <SignedIn>
            <Link to="/profile" className="sign-up">
                My Profile
            </Link>
            <button className="log-in" onClick={() => signOut().then(() => navigate('/'))}>
                Log Out
            </button>
            </SignedIn>
        </div>
      </section>

      <section className="home-body">
        <img className="logo" src={Logo} alt="logo" />

        <h1>Search for a Player</h1>

        <div className="search-step">
          <label className="search-label">Select World</label>
          <WorldSelector
            value={selectedWorld}
            onChange={setSelectedWorld}
            placeholder="Select realm and world..."
          />
        </div>

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

        <button
          className="search-button"
          onClick={handleSearch}
          disabled={!selectedWorld || !characterName.trim()}
        >
          Search Player
        </button>

      </section>

      <section className="home-more-info">
        <h1>
          Rate Players.<br />
          Build Community.<br />
          Adventure Better.
        </h1>
        <h3>Running content in FFXIV is better with great teammates. <br /> Rate your fellow Warriors of Light, find reliable players for your next adventure, and help the community identify exceptional party members. <br />Share your experiences and discover players who'll make your journey through Eorzea unforgettable.</h3>
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

        <SignedOut>
          <button
            className="black-rounded-btn"
            onClick={() => openSignUp()}
          >
            Sign up now!
          </button>
        </SignedOut>
      </section>

      <section className="footer"></section>
    </>
  );
}

export default Home;