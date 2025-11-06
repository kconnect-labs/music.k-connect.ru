import React, { useRef } from 'react';
import { useMusic } from '../../context/MusicContext';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon, VolumeUpIcon, VolumeDownIcon } from '../icons/CustomIcons';
import MusicService from '../../services/MusicService';
import './HeaderPlayer.css';

interface HeaderPlayerProps {
  onCoverClick?: () => void;
}

const HeaderPlayer: React.FC<HeaderPlayerProps> = ({ onCoverClick }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    setVolume,
    likeTrack,
    playNextTrack,
    playPreviousTrack,
  } = useMusic();

  const volumeButtonRef = useRef<HTMLButtonElement>(null);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const handleNext = () => {
    playNextTrack();
  };

  const handlePrev = () => {
    playPreviousTrack();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack) {
      await likeTrack(currentTrack.id);
    }
  };


  if (!currentTrack) {
    return null;
  }

  const coverUrl = MusicService.getCoverUrl(currentTrack);

  return (
    <div className="header-player">
      <div className="header-player-content">
        {/* Обложка трека */}
        <div 
          className="header-player-cover"
          onClick={(e) => {
            e.stopPropagation();
            if (onCoverClick) {
              onCoverClick();
            }
          }}
        >
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={currentTrack.title}
            />
          ) : (
            <div className="header-player-cover-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          )}
          {/* Overlay с иконкой лайка при наведении */}
          <div className="header-player-cover-overlay">
            <button
              className={`header-player-like-button ${currentTrack.is_liked ? 'liked' : ''}`}
              onClick={handleLikeClick}
              aria-label={currentTrack.is_liked ? 'Убрать лайк' : 'Лайкнуть трек'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={currentTrack.is_liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Информация о треке */}
        <div className="header-player-info">
          <div className="header-player-title">{currentTrack.title}</div>
          <div className="header-player-artist">{currentTrack.artist}</div>
        </div>

        {/* Контролы */}
        <div className="header-player-controls">
          <button
            className="header-player-control-btn"
            onClick={handlePrev}
            aria-label="Предыдущий трек"
          >
            <BackwardIcon size={16} color="currentColor" />
          </button>
          <button
            className="header-player-control-btn header-player-control-btn--play"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? (
              <PauseIcon size={18} color="currentColor" />
            ) : (
              <PlayIcon size={18} color="currentColor" />
            )}
          </button>
          <button
            className="header-player-control-btn"
            onClick={handleNext}
            aria-label="Следующий трек"
          >
            <ForwardIcon size={16} color="currentColor" />
          </button>
        </div>

        {/* Время */}
        <div className="header-player-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Громкость */}
        <div className="header-player-volume-wrapper">
          <button
            ref={volumeButtonRef}
            className="header-player-volume-btn"
            aria-label="Громкость"
          >
            {volume === 0 ? (
              <VolumeDownIcon size={16} color="currentColor" />
            ) : (
              <VolumeUpIcon size={16} color="currentColor" />
            )}
          </button>
          <div className="header-player-volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="header-player-volume-slider"
              aria-label="Громкость"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HeaderPlayer);

