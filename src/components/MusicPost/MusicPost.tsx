import React from 'react';
import './MusicPost.css';

interface MusicPostProps {
  id: string;
  artist: string;
  title: string;
  coverUrl?: string;
  duration?: string;
  likes?: number;
  plays?: number;
  date?: string;
  onClick?: () => void;
}

export const MusicPost: React.FC<MusicPostProps> = ({
  id,
  artist,
  title,
  coverUrl,
  duration = '3:24',
  likes = 0,
  plays = 0,
  date,
  onClick,
}) => {
  return (
    <div className="music-post" onClick={onClick}>
      <div className="music-post-cover">
        {coverUrl ? (
          <img src={coverUrl} alt={`${artist} - ${title}`} />
        ) : (
          <div className="music-post-cover-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        )}
        <div className="music-post-play-overlay">
          <button className="music-post-play-button" aria-label="Воспроизвести">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="music-post-info">
        <div className="music-post-main">
          <h3 className="music-post-title">{title}</h3>
          <p className="music-post-artist">{artist}</p>
        </div>
        
        <div className="music-post-meta">
          {duration && (
            <span className="music-post-duration">{duration}</span>
          )}
          {plays > 0 && (
            <span className="music-post-plays">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {plays}
            </span>
          )}
          {likes > 0 && (
            <button className="music-post-like" aria-label="Нравится">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likes}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPost;

