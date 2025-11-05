import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PlayerInfo } from '../../types/player'; 
import ResultCard from '../../components/ResultCard';
import { searchCharacters } from '../../services/api';
import Header from '../../components/Header/Header';
import './ResultsPage.css';

interface ResultsPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

function ResultsPage({ onLoginClick, onSignUpClick }: ResultsPageProps) {
  const { category, query } = useParams<{ 
    category?: string; 
    query?: string; 
  }>();
  
  const [results, setResults] = useState<PlayerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState(query);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!query) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching characters for query: ${query}`);
        const data = await searchCharacters(query);
        console.log(`Received ${data.length} characters`);
        console.log(data[0])
        setResults(data);
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Failed to load characters. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [category, query]);

  function handleCardClick(player: PlayerInfo) {
    console.log('Navigate to player profile:', player.id);
    navigate(`/detailpage/${player.id}`, {
      state: {
        id: player.id,
        name: player.characterName,
        portrait: player.portrait,
        server: player.serverName,
        world: player.worldName
      }
    });
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && newQuery) {
      navigate(`/results/${category}/${encodeURIComponent(newQuery)}`);
    }
  }

  const isPlayerSearch = category === 'player';
  const isServerSearch = category === 'server';

  if (loading) {
    return (
      <div className="results-page__loading">
        <div className="results-page__spinner"></div>
        <p className="results-page__loading-message">
          Searching Lodestone...
        </p>
        <p className="results-page__loading-tip">
          This may take 30-60 seconds for common names.
        </p>
      </div>
    );
  }

  return (
    <>
      
      <Header 
        playerName={newQuery ?? ''}  
        onChange={(e) => setNewQuery(e.target.value)} 
        handleKeyPress={handleKeyPress} 
        onLoginClick={onLoginClick} 
        onSignUpClick={onSignUpClick}
      />
      
      
      <div className="results-page">
        <div className="results-page__container">
          <div className="results-page__header">
            <h1 className="results-page__title">
              {isPlayerSearch && `Player Search: "${query}"`}
              {isServerSearch && `Server Search: "${query}"`}
              {!isPlayerSearch && !isServerSearch && 'Players of Light'}
            </h1>
            <p className="results-page__count">
              Found {results.length} player{results.length !== 1 ? 's' : ''}
            </p>
          </div>

          {error && (
            <div className="results-page__error">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {!error && results.length > 0 && (
            <div className="results-page__grid">
              {results.map((player) => (
                <ResultCard
                  key={player.id}
                  player={player}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          )}

          {!error && results.length === 0 && !loading && (
            <div className="results-page__no-results">
              <p className="results-page__no-results-title">No players found.</p>
              {isPlayerSearch && (
                <p className="results-page__no-results-subtitle">
                  No players found matching "{query}"
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