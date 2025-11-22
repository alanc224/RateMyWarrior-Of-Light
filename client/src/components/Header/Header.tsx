import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../services/AuthContext"; 
import Logo from "../../assets/header/rmw-logo.png";
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, playerName, setModalView } = useAuth();

  const handleLoginClick = () => setModalView('LOGIN');
  const handleSignUpClick = () => setModalView('SIGN_UP');

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="header">
      <img className="header-img" src={Logo} onClick={() => navigate('/')} />
      
      {!isAuthenticated ? (
        <div className="header-buttons-container">
          <button className="header-account-btns" onClick={handleLoginClick}>Log In</button>
          <button className="header-account-btns header-account-outline" onClick={handleSignUpClick}>Sign Up</button>
        </div>
      ) : (
        <div className="header-buttons-container">
          <button className="header-account-btns" onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </div>
  );
};

export default Header;
