import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '../UI';
import { useMusic } from '../context/MusicContext';
import MusicService, { Track } from '../services/MusicService';
import './LibraryPage.css';

type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'library_view_mode';

const LibraryPage: React.FC = () => {
  const { playTrack, isPlaying, currentTrack } = useMusic();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const toggleViewMode = useCallback(() => {
    const newMode: ViewMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, [viewMode]);

  // На мобильных загружаем в 2 раза больше треков
  const getPerPage = useCallback(() => {
    return window.innerWidth <= 768 ? 40 : 20;
  }, []);

  const fetchTracks = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const perPage = getPerPage();
      const response = await MusicService.getLikedTracks(page, perPage);

      if (response.success && response.tracks) {
        if (append) {
          setTracks((prev) => [...prev, ...response.tracks!]);
        } else {
          setTracks(response.tracks);
        }
        setTotalPages(response.pages || 1);
        setTotal(response.total || 0);
        setHasMore(page < (response.pages || 1));
      }
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks(1, false);
  }, [fetchTracks]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setCurrentPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchTracks(nextPage, true);
            return nextPage;
          });
        }
      },
      {
        threshold: 0.5, // Срабатывает когда видно 50% элемента
        rootMargin: '100px', // Начинаем загрузку немного раньше
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, fetchTracks]);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      if (isPlaying && currentTrack?.id === track.id) {
        return;
      }
      playTrack(track, 'liked');
    },
    [isPlaying, currentTrack, playTrack]
  );

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="library-page">
      <div className="library-container">
        <PageHeader
          title="Моя музыка"
          subtitle={`${total} ${total === 1 ? 'трек' : total < 5 ? 'трека' : 'треков'}`}
          action={
            tracks.length > 0 && (
              <button
                className="library-view-toggle"
                onClick={toggleViewMode}
                aria-label={viewMode === 'grid' ? 'Переключить на список' : 'Переключить на сетку'}
                title={viewMode === 'grid' ? 'Список' : 'Сетка'}
              >
                {viewMode === 'grid' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                )}
              </button>
            )
          }
        />

        {isLoading ? (
          <div className="library-loading">
            <div className="loading-spinner-large" />
            <p>Загрузка библиотеки...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="library-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3>Библиотека пуста</h3>
            <p>Лайкайте треки, чтобы они появлялись здесь</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'library-grid' : 'library-list'}>
              {tracks.map((track, index) => {
                const perPage = getPerPage();
                const trackNumber = (currentPage - 1) * perPage + index + 1;
                return (
                <div
                  key={track.id}
                  className={`library-track library-track--${viewMode}`}
                  onClick={() => handlePlayTrack(track)}
                >
                  {viewMode === 'list' && (
                    <div className="library-track-number">
                      {isPlaying && currentTrack?.id === track.id ? (
                        <div className="library-track-playing-indicator">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        </div>
                      ) : (
                        <span>{trackNumber}</span>
                      )}
                    </div>
                  )}

                  <div className="library-track-cover">
                    {MusicService.getCoverUrl(track) ? (
                      <img
                        src={MusicService.getCoverUrl(track)}
                        alt={`${track.artist} - ${track.title}`}
                      />
                    ) : (
                      <div className="library-track-cover-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    )}
                    {viewMode === 'grid' && (
                      <div className="library-track-play-overlay">
                        <button
                          className={`library-track-play-button ${isPlaying && currentTrack?.id === track.id ? 'playing' : ''}`}
                          aria-label="Воспроизвести"
                        >
                          {isPlaying && currentTrack?.id === track.id ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="4" width="4" height="16" />
                              <rect x="14" y="4" width="4" height="16" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="library-track-info">
                    {viewMode === 'list' ? (
                      <>
                        <div className="library-track-title">{track.title}</div>
                        <div className="library-track-artist">{track.artist}</div>
                        <span className="library-track-duration">{formatDuration(track.duration)}</span>
                      </>
                    ) : (
                      <>
                        <div className="library-track-title">{track.title}</div>
                        <div className="library-track-artist">{track.artist}</div>
                      </>
                    )}
                  </div>

                  {viewMode === 'list' && (
                    <button
                      className={`library-track-play-button-list ${isPlaying && currentTrack?.id === track.id ? 'playing' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(track);
                      }}
                      aria-label={isPlaying && currentTrack?.id === track.id ? 'Пауза' : 'Воспроизвести'}
                    >
                      {isPlaying && currentTrack?.id === track.id ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                  )}

                  {viewMode === 'grid' && (
                    <div className="library-track-meta">
                      <span className="library-track-duration">{formatDuration(track.duration)}</span>
                      {track.plays_count && track.plays_count > 0 && (
                        <span className="library-track-plays">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          {track.plays_count}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>

            {/* Элемент для отслеживания прокрутки */}
            {hasMore && (
              <div ref={observerTarget} className="library-scroll-trigger">
                {isLoadingMore && (
                  <div className="library-loading-more">
                    <div className="loading-spinner-large" />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;

