import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../UI';
import PlaylistService, { Playlist } from '../services/PlaylistService';
import './PlaylistsPage.css';

const PlaylistsPage: React.FC = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await PlaylistService.getUserPlaylists();

      if (response.success && response.playlists) {
        setPlaylists(response.playlists);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handlePlaylistClick = (playlistId: number) => {
    navigate(`/playlists/${playlistId}`);
  };

  return (
    <div className="playlists-page">
      <div className="playlists-container">
        <PageHeader
          title="Мои плейлисты"
          subtitle={`${playlists.length} ${playlists.length === 1 ? 'плейлист' : playlists.length < 5 ? 'плейлиста' : 'плейлистов'}`}
        />

        {isLoading ? (
          <div className="playlists-loading">
            <div className="loading-spinner-large" />
            <p>Загрузка плейлистов...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="playlists-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <h3>У вас пока нет плейлистов</h3>
            <p>Создайте плейлист, чтобы начать собирать любимые треки</p>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="playlist-card"
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <div className="playlist-card-cover">
                  {playlist.cover_url ? (
                    <img
                      src={playlist.cover_url}
                      alt={playlist.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="playlist-card-cover-placeholder"
                    style={{ display: playlist.cover_url ? 'none' : 'flex' }}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="9" x2="15" y2="9" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div className="playlist-card-play-overlay">
                    <button
                      className="playlist-card-play-button"
                      aria-label="Открыть плейлист"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="playlist-card-info">
                  <div className="playlist-card-name">{playlist.name}</div>
                  {playlist.description && (
                    <div className="playlist-card-description">{playlist.description}</div>
                  )}
                  <div className="playlist-card-meta">
                    {playlist.track_count || playlist.tracks_count || 0}{' '}
                    {(playlist.track_count || playlist.tracks_count || 0) === 1
                      ? 'трек'
                      : (playlist.track_count || playlist.tracks_count || 0) < 5
                      ? 'трека'
                      : 'треков'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistsPage;

