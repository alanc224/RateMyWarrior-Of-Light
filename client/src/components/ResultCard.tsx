import React from 'react';
import type { PlayerInfo } from '../types/player';
import './ResultCard.css';

interface ResultCardProps {
  player: PlayerInfo;
  onClick?: (player: PlayerInfo) => void;
}

function ResultCard({ player, onClick }: ResultCardProps) {
  return (
    <div 
      className="result-card"
      onClick={() => onClick?.(player)}
    >
      {/* Character Name */}
      <h3 className="result-card__name">
        {player.characterName}
      </h3>

      {/* Basic Info */}
      <div className="result-card__info">

        {/* Server */}
        <p className="result-card__server">
          {player.serverName}
        </p>

        {/* Rating */}
        {player.rating ? (
          <div className="result-card__rating-container">
            <span className="result-card__rating-star">★</span>
            <span className="result-card__rating-score">
              {player.rating.toFixed(1)}
            </span>
            {player.reviewCount && (
              <span className="result-card__rating-count">
                ({player.reviewCount})
              </span>
            )}
          </div>
        ) : (
          <div className="result-card__no-rating">
            <span className="result-card__no-rating-text">No ratings yet</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultCard;