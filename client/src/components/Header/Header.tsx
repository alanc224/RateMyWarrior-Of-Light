import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useClerk } from '@clerk/clerk-react';
import Logo from "../../assets/homepage/logo.png";
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { openSignUp, openSignIn } = useClerk();

  return (
    <div className="header">
      <img className="header-img" src={Logo} onClick={() => navigate('/')} alt="Logo" style={{ cursor: 'pointer' }} />
    
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
        <div className="header-buttons-container" style={{ display: 'flex', alignItems: 'center' }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
};

export default Header;