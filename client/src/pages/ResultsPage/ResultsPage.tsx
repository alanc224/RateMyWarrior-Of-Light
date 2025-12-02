import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { PlayerInfo } from '../../types/player'; 
import ResultCard from '../../components/ResultCard';
import { searchCharacters } from '../../services/api';
import Header from '../../components/Header/Header';
import './ResultsPage.css';

function ResultsPage() {
  const { category, world, query } = useParams<{ 
    category?: string;
    world?: string;
    query?: string; 
  }>();
  
  const [allResults, setAllResults] = useState<PlayerInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const RESULTS_PER_PAGE = 10;

  // Calculate pagination
  const totalPages = Math.ceil(allResults.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentResults = allResults.slice(startIndex, endIndex);

  useEffect(() => {
    async function fetchData() {
      if (!query) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      setCurrentPage(1); // Reset to page 1 on new search
      
      try {
        console.log(`Fetching characters for query: ${query}`);
        let data = await searchCharacters(query);
        console.log(`Received ${data.length} characters`);
        console.log(data)
        setAllResults(data);
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Failed to load characters. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [category, world, query]);

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

  function goToPage(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  const isPlayerSearch = category === 'player';

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
      <Header />
      
      <div className="results-page">
        <div className="results-page__container">
          <div className="results-page__header">
            <h1 className="results-page__title">
              {isPlayerSearch && (
                <>
                  Player: "{query}"
                  {world && <span className="results-page__world"> on {world}</span>}
                </>
              )}
              {!isPlayerSearch && 'Players of Light'}
            </h1>
            <p className="results-page__count">
              Found {allResults.length} player{allResults.length !== 1 ? 's' : ''}
              {allResults.length > RESULTS_PER_PAGE && (
                <span> (Showing {startIndex + 1}-{Math.min(endIndex, allResults.length)})</span>
              )}
            </p>
          </div>

          {error && (
            <div className="results-page__error">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {!error && currentResults.length > 0 && (
            <>
              <div className="results-page__grid">
                {currentResults.map((player) => (
                  <ResultCard
                    key={player.id}
                    player={player}
                    onClick={handleCardClick}
                  />
                ))}
              </div>

              {/* Smart Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  {/* Previous Button */}
                  <button 
                    onClick={previousPage} 
                    disabled={currentPage === 1}
                    className="pagination__button"
                  >
                    ← Previous
                  </button>
                  
                  {/* Smart Page Numbers */}
                  <div className="pagination__pages">
                    {/* Always show first page */}
                    <button
                      onClick={() => goToPage(1)}
                      className={`pagination__page ${currentPage === 1 ? 'pagination__page--active' : ''}`}
                    >
                      1
                    </button>
                    
                    {/* Show dots if there's a gap after first page */}
                    {currentPage > 3 && (
                      <span className="pagination__dots">...</span>
                    )}
                    
                    {/* Show pages around current page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show current page and 1 page on each side
                        return page !== 1 && 
                               page !== totalPages && 
                               page >= currentPage - 1 && 
                               page <= currentPage + 1;
                      })
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`pagination__page ${page === currentPage ? 'pagination__page--active' : ''}`}
                        >
                          {page}
                        </button>
                      ))
                    }
                    
                    {/* Show dots if there's a gap before last page */}
                    {currentPage < totalPages - 2 && (
                      <span className="pagination__dots">...</span>
                    )}
                    
                    {/* Always show last page if there's more than 1 page */}
                    {totalPages > 1 && (
                      <button
                        onClick={() => goToPage(totalPages)}
                        className={`pagination__page ${currentPage === totalPages ? 'pagination__page--active' : ''}`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
                  
                  {/* Next Button */}
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination__button"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {!error && allResults.length === 0 && !loading && (
            <div className="results-page__no-results">
              <p className="results-page__no-results-title">No players found.</p>
              {isPlayerSearch && (
                <p className="results-page__no-results-subtitle">
                  No players found matching "{query}"{world && ` on ${world}`}
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