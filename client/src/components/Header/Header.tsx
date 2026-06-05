import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import Logo from "../../assets/homepage/logo.png";
import './Header.css';
import WorldSelector from '../WorldSelector/WorldSelector';

const Header = () => {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState('');
  const { openSignUp, openSignIn, signOut } = useClerk();
  const [searchWorld, setSearchWorld] = useState('');
  const isSearchDisabled = !searchName.trim() || !searchWorld;

  const handleSearch = () => {
    if (searchName) navigate(`/results/player/${searchWorld}/${searchName}`);
  };

  return (
    <div className="header">
      <img className="header-img" src={Logo} onClick={() => navigate('/')} alt="Logo" style={{ cursor: 'pointer' }} />

      <div className="header-search-container">
        <input 
          className="header-input" 
          placeholder="Character name..." 
          value={searchName} 
          onChange={(e) => setSearchName(e.target.value)}
        />
    
        <WorldSelector 
          value={searchWorld} 
          onChange={(world) => setSearchWorld(world)} 
        />

        <button className="header-search-btn" onClick={handleSearch} disabled={isSearchDisabled}>Search</button>
      </div>
    
      <SignedOut>
        <div className="header-buttons-container">
          <button 
            className="header-account-btns header-account-outline" 
            onClick={() => openSignUp()}
          >
            Sign Up
          </button>
          <button 
            className="header-account-btns" 
            onClick={() => openSignIn()}
          >
            Log In
          </button>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="header-buttons-container">
            <Link to="/profile" className="header-account-btns header-account-outline">
            My Profile
            </Link>
            <button className="header-account-btns" onClick={() => signOut().then(() => navigate('/'))}>
            Log Out
            </button>
        </div>
        </SignedIn>
    </div>
  );
};

export default Header;