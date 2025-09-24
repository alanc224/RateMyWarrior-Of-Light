//import "./ResultsPage.css"
import React, { useState, useEffect } from 'react';
import type { PlayerInfo } from '../../types/player'; 
import ResultCard from '../../components/ResultCard';
import { getMockResults } from '../../testing/mockData';
import { useParams } from 'react-router-dom';
import './ResultsPage.css'

function ResultsPage() {
  const { searchQuery, serverName } = useParams<{ 
    searchQuery?: string; 
    serverName?: string; 
  }>();
  const [results, setResults] = useState<PlayerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load players when component mounts or params change
  useEffect(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setResults(getMockResults());
      setLoading(false);
    }, 1000);
  }, [searchQuery, serverName]); // Re-run when URL params change

  function handleCardClick(player: PlayerInfo) {
    console.log('Navigate to player profile:', player.id);
    // Handle navigation to player profile page
  }

  // Determine what type of search this is
  const isPlayerSearch = !!searchQuery;
  const isServerSearch = !!serverName;
  
if (loading) {
    return (
      <div className="results-page__loading">
        <div className="results-page__spinner"></div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-page__container">
        {/* Header */}
        <div className="results-page__header">
          <h1 className="results-page__title">
            {isPlayerSearch && `Player Search: "${searchQuery}"`}
            {isServerSearch && `Server Search: "${serverName}"`}
            {!isPlayerSearch && !isServerSearch && 'players of Light'}
          </h1>
          <p className="results-page__count">
            Found {results.length} player{results.length !== 1 ? 's' : ''}
            {isPlayerSearch && ` matching "${searchQuery}"`}
            {isServerSearch && ` from server "${serverName}"`}
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
                No players found matching "{searchQuery}"
              </p>
            )}
            {isServerSearch && (
              <p className="results-page__no-results-subtitle">
                No players found on server "{serverName}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;