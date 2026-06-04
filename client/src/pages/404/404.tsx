import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header/Header"; 
import './404.css';
import notFoundImage from '../../assets/404.png';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-wrapper">
      <Header />
      <main className="not-found-content">
        <img src={notFoundImage} alt="404 Not Found" className="not-found-img" />
        
        <h1 className="not-found-title">404</h1>
        <p className="not-found-text">The page you are looking for has been moved or doesn't exist.</p>
        <button onClick={() => navigate('/')} className="header-search-btn">
          Return Home
        </button>
      </main>
    </div>
  );
};

export default NotFound;