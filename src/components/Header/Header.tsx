import React, { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import HeaderPlayer from '../HeaderPlayer/HeaderPlayer';
import Timeline from './Timeline';
import './Header.css';

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  onOpenFullScreenPlayer?: () => void;
}

const Header: React.FC<HeaderProps> = ({ className = '', onMenuClick, onOpenFullScreenPlayer }) => {
  const { user } = useAuth();
  const { currentTrack, duration, seekTo } = useMusic();
  const [logoError, setLogoError] = React.useState(false);

  const getUserAvatarUrl = () => {
    if (user && 'avatar_url' in user && user.avatar_url) {
      return user.avatar_url as string;
    }
    return null;
  };

  const getUserInitials = () => {
    if (user && 'username' in user) {
      return (user.username as string).charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleTimelineSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || !currentTrack) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  }, [duration, currentTrack, seekTo]);


  return (
    <header className={`header ${className}`}>
      <div className="header-container">
        {/* Левая часть - Кнопка меню + Логотип + Текст */}
        <div className="header-left">
          <button
            className="header-menu-button"
            onClick={onMenuClick}
            aria-label="Открыть меню"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="header-logo-container">
            {!logoError ? (
              <img
                src="https://k-connect.ru/static/images/icon.png"
                alt="K-Connect"
                className="header-logo"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="header-logo-placeholder">K</div>
            )}
          </div>
        </div>

        {/* Центральная часть - Блок плеера */}
        <div 
          className="header-center"
          onClick={(e) => {
            // Открываем FullScreenPlayer только если клик не на кнопку
            const target = e.target as HTMLElement;
            if (!target.closest('button') && !target.closest('.header-player-cover') && onOpenFullScreenPlayer) {
              onOpenFullScreenPlayer();
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <HeaderPlayer onCoverClick={onOpenFullScreenPlayer} />
        </div>

        {/* Правая часть - Аватарка */}
        <div className="header-right">
          <div className="header-avatar-container">
            <div className="header-avatar-wrapper">
              {getUserAvatarUrl() ? (
                <img
                  src={getUserAvatarUrl() || ''}
                  alt={user?.username || 'User'}
                  className="header-avatar"
                />
              ) : (
                <div className="header-avatar-placeholder">
                  {getUserInitials()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Таймлайн по всей ширине хедера */}
        <Timeline onSeek={handleTimelineSeek} />
      </div>
    </header>
  );
};

export default Header;

