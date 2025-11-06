import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../UI';
import { useMusic } from '../context/MusicContext';
import PlaylistService, { Playlist } from '../services/PlaylistService';
import MusicService, { Track } from '../services/MusicService';
import './PlaylistDetailPage.css';

const PlaylistDetailPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { playTrack, isPlaying, currentTrack } = useMusic();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaylist = useCallback(async () => {
    if (!playlistId) return;

    try {
      setIsLoading(true);
      const response = await PlaylistService.getPlaylist(parseInt(playlistId));

      if (response.success && response.playlist) {
        setPlaylist(response.playlist);
        // Треки приходят в response.playlist.tracks
        const playlistTracks = response.playlist.tracks;
        if (playlistTracks && Array.isArray(playlistTracks)) {
          setTracks(playlistTracks);
        } else {
          setTracks([]);
        }
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      if (isPlaying && currentTrack?.id === track.id) {
        return;
      }
      playTrack(track, `playlist_${playlistId}`);
    },
    [isPlaying, currentTrack, playTrack, playlistId]
  );

  const handlePlayAll = useCallback(() => {
    if (tracks.length > 0) {
      playTrack(tracks[0], `playlist_${playlistId}`);
    }
  }, [tracks, playTrack, playlistId]);

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="playlist-detail-page">
        <div className="playlist-detail-loading">
          <div className="loading-spinner-large" />
          <p>Загрузка плейлиста...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="playlist-detail-page">
        <div className="playlist-detail-empty">
          <h3>Плейлист не найден</h3>
          <button onClick={() => navigate('/playlists')} className="playlist-detail-back-button">
            Вернуться к плейлистам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-detail-page">
      <div className="playlist-detail-container">
        <PageHeader
          title={playlist.name}
          subtitle={playlist.description || `${tracks.length} ${tracks.length === 1 ? 'трек' : tracks.length < 5 ? 'трека' : 'треков'}`}
          action={
            tracks.length > 0 && (
              <button
                className="playlist-detail-play-all-button"
                onClick={handlePlayAll}
                aria-label="Воспроизвести все"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Воспроизвести</span>
              </button>
            )
          }
        />

        <div className="playlist-detail-content">
          {/* Список треков */}
          {tracks.length === 0 ? (
            <div className="playlist-detail-empty-tracks">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <h3>Плейлист пуст</h3>
              <p>Добавьте треки в плейлист, чтобы начать слушать</p>
            </div>
          ) : (
            <div className="playlist-detail-tracks">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`playlist-detail-track ${isPlaying && currentTrack?.id === track.id ? 'playing' : ''}`}
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="playlist-detail-track-number">
                    {isPlaying && currentTrack?.id === track.id ? (
                      <div className="playlist-detail-track-playing-indicator">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className="playlist-detail-track-cover">
                    {MusicService.getCoverUrl(track) ? (
                      <img
                        src={MusicService.getCoverUrl(track)}
                        alt={`${track.artist} - ${track.title}`}
                      />
                    ) : (
                      <div className="playlist-detail-track-cover-placeholder">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="playlist-detail-track-info">
                    <div className="playlist-detail-track-title">{track.title}</div>
                    <div className="playlist-detail-track-artist">{track.artist}</div>
                  </div>

                  <div className="playlist-detail-track-duration">{formatDuration(track.duration)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailPage;

