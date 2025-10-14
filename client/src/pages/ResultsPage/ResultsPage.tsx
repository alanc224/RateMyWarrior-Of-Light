//import "./ResultsPage.css"
import React, { useState, useEffect } from 'react';
import type { PlayerInfo } from '../../types/player'; 
import ResultCard from '../../components/ResultCard';
import { getMockResults } from '../../testing/mockData';
import { useParams, useNavigate } from 'react-router-dom';
import './ResultsPage.css'

import Header from '../../components/Header/Header';


interface ResultsPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

function ResultsPage({ onLoginClick, onSignUpClick }: ResultsPageProps) {
  const { category, query  } = useParams<{ 
    category?: string; 
    query?: string; 
  }>();
  const [results, setResults] = useState<PlayerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const[newQuery, setNewQuery] = useState(query)
  const navigate = useNavigate();

  // Load players when component mounts or params change
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setResults(getMockResults());
      setLoading(false);
    }, 1000);

    //Fetch from backend
    // const fetchData = async () => {
    //   const response = await fetch(`http://localhost:5001/api/characters?name=${query}`);
    //   const data = await response.json();
    //   setResults(data.slice(0, 10));
    // }
    // fetchData()
    // setLoading(false)
  }, [category, query]); // Re-run when URL params change

  function handleCardClick(player: PlayerInfo) {
    console.log('Navigate to player profile:', player.id);
    // Handle navigation to player profile page
  }

  // Determine what type of search this is
  const isPlayerSearch = category === 'player';
  const isServerSearch = category === 'server';
  
  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && newQuery) {
      navigate(`/results/${category}/${newQuery}`);
    }
  }

if (loading) {
    return (
      <div className="results-page__loading">
        <div className="results-page__spinner"></div>
      </div>
    );
  }

  return (
    <>
    {(isPlayerSearch || isServerSearch) &&  <Header playerName={newQuery ?? ''}  onChange={(e) => {setNewQuery(e.target.value)}} handleKeyPress={handleKeyPress} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick}/>}
    {/* {isPlayerSearch &&  <Header playerName={newQuery ?? ''}  onChange={(e) => {setNewQuery(e.target.value)}} handleKeyPress={handleKeyPress} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick}/>} */}
    <div className="results-page">
      <div className="results-page__container">
        {/* Header */}
        <div className="results-page__header">
          <h1 className="results-page__title">
            {isPlayerSearch && `Player Search: "${query}"`}
            {isServerSearch && `Server Search: "${query}"`}
            {!isPlayerSearch && !isServerSearch && 'players of Light'}
          </h1>
          <p className="results-page__count">
            Found {results.length} player{results.length !== 1 ? 's' : ''}
            {isPlayerSearch && ` matching "${query}"`}
            {isServerSearch && ` from server "${query}"`}
          </p>
        </div>

        {/* Results Grid */}
        <div className="results-page__grid">
          {results.map((player) => (
            <ResultCard
            key={player.id}
            player={player}
            onClick={handleCardClick}
            />
          ))}
        </div>

        {/* No Results */}
        {results.length === 0 && (
          <div className="results-page__no-results">
            <p className="results-page__no-results-title">No players found.</p>
            {isPlayerSearch && (
              <p className="results-page__no-results-subtitle">
                No players found matching "{query}"
              </p>
            )}
            {isServerSearch && (
              <p className="results-page__no-results-subtitle">
                No players found on server "{query}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default ResultsPage;