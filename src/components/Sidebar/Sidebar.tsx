import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const menuItems = [
    {
      id: 'home',
      label: 'Главная',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: '/',
    },
    {
      id: 'library',
      label: 'Моя библиотека',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
      path: '/library',
    },
    {
      id: 'playlists',
      label: 'Плейлисты',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      path: '/playlists',
    },
    {
      id: 'search',
      label: 'Поиск',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
      path: '/search',
    },
    {
      id: 'upload',
      label: 'Загрузка',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      path: '/upload',
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    // Закрываем сайдбар на мобильных устройствах
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Сайдбар */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar-menu-item ${isActive(item.path) ? 'sidebar-menu-item--active' : ''}`}
                  onClick={() => handleNavigate(item.path)}
                >
                  <span className="sidebar-menu-item-icon">{item.icon}</span>
                  <span className="sidebar-menu-item-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-section">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {getUserAvatarUrl() ? (
                  <img
                    src={getUserAvatarUrl() || ''}
                    alt={user?.username || 'User'}
                  />
                ) : (
                  <div className="sidebar-user-avatar-placeholder">
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">
                  {user?.username || 'Пользователь'}
                </div>
                {user?.email && (
                  <div className="sidebar-user-email">
                    {user.email}
                  </div>
                )}
              </div>
            </div>
            <div className="sidebar-user-menu">
              <button
                className="sidebar-user-menu-item sidebar-user-menu-item--danger"
                onClick={handleLogout}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Выйти</span>
              </button>
            </div>
          </div>
          <div className="sidebar-footer-content">
            <p className="sidebar-footer-text">К-Коннект Music</p>
            <p className="sidebar-footer-version">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

