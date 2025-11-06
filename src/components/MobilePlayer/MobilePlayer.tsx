import React from 'react';
import { useMusic } from '../../context/MusicContext';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from '../icons/CustomIcons';
import MusicService from '../../services/MusicService';
import './MobilePlayer.css';

interface MobilePlayerProps {
  onOpenFullScreenPlayer?: () => void;
}

const MobilePlayer: React.FC<MobilePlayerProps> = ({ onOpenFullScreenPlayer }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNextTrack,
    playPreviousTrack,
  } = useMusic();

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

  if (!currentTrack) {
    return null;
  }

  const coverUrl = MusicService.getCoverUrl(currentTrack);

  const handlePlayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Открываем FullScreenPlayer только если клик не на кнопку
    const target = e.target as HTMLElement;
    if (!target.closest('button') && onOpenFullScreenPlayer) {
      onOpenFullScreenPlayer();
    }
  };

  return (
    <div className="mobile-player" onClick={handlePlayerClick} style={{ cursor: 'pointer' }}>
      <div className="mobile-player-content">
        {/* Обложка трека */}
        <div className="mobile-player-cover">
          {coverUrl ? (
            <img src={coverUrl} alt={currentTrack.title} />
          ) : (
            <div className="mobile-player-cover-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          )}
        </div>

        {/* Информация о треке */}
        <div className="mobile-player-info">
          <div className="mobile-player-title">{currentTrack.title}</div>
          <div className="mobile-player-artist">{currentTrack.artist}</div>
        </div>

        {/* Контролы */}
        <div className="mobile-player-controls">
          <button
            className="mobile-player-control-btn"
            onClick={handlePrev}
            aria-label="Предыдущий трек"
          >
            <BackwardIcon size={20} color="currentColor" className="" />
          </button>
          <button
            className="mobile-player-control-btn mobile-player-control-btn--play"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? (
              <PauseIcon size={24} color="currentColor" className="" />
            ) : (
              <PlayIcon size={24} color="currentColor" className="" />
            )}
          </button>
          <button
            className="mobile-player-control-btn"
            onClick={handleNext}
            aria-label="Следующий трек"
          >
            <ForwardIcon size={20} color="currentColor" className="" />
          </button>
        </div>

        {/* Время */}
        <div className="mobile-player-time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MobilePlayer);

