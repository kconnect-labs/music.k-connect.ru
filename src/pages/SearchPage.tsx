import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '../UI';
import { useMusic } from '../context/MusicContext';
import SearchService from '../services/SearchService';
import MusicService, { Track } from '../services/MusicService';
import './SearchPage.css';

const SearchPage: React.FC = () => {
  const { playTrack, isPlaying, currentTrack } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const searchQueryRef = useRef<string>('');

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setTracks([]);
      setIsLoading(false);
      setHasSearched(false);
      searchQueryRef.current = '';
      return;
    }

    // Сохраняем текущий запрос для проверки актуальности результата
    searchQueryRef.current = query;
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await SearchService.searchTracks(query);

      // Проверяем, что запрос не изменился пока выполнялся запрос
      if (searchQueryRef.current === query) {
        if (response.tracks) {
          setTracks(response.tracks);
        } else {
          setTracks([]);
        }
      }
    } catch (error: any) {
      // Проверяем актуальность запроса только если он не изменился
      if (searchQueryRef.current === query) {
        console.error('Error searching tracks:', error);
        setTracks([]);
      }
    } finally {
      // Обновляем состояние только если запрос актуален
      if (searchQueryRef.current === query) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Очищаем предыдущий таймаут
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Если запрос слишком короткий, сразу очищаем результаты
    if (!value || value.trim().length < 2) {
      setTracks([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    // Устанавливаем новую задержку для debounce (500ms)
    debounceTimeoutRef.current = window.setTimeout(() => {
      performSearch(value);
    }, 500);
  }, [performSearch]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      if (isPlaying && currentTrack?.id === track.id) {
        return;
      }
      playTrack(track, 'search');
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
    <div className="search-page">
      <div className="search-container">
        <PageHeader
          title="Поиск"
          subtitle="Найдите любимую музыку"
        />

        {/* Поисковая строка */}
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <svg
              className="search-input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Исполнитель, трек, альбом..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            {isLoading && (
              <div className="search-input-loading">
                <div className="loading-spinner-small" />
              </div>
            )}
          </div>
        </div>

        {/* Результаты поиска */}
        {!hasSearched && searchQuery.length < 2 ? (
          <div className="search-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <h3>Начните поиск</h3>
            <p>Введите название трека, имя исполнителя или альбом</p>
          </div>
        ) : isLoading && tracks.length === 0 ? (
          <div className="search-loading">
            <div className="loading-spinner-large" />
            <p>Поиск...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="search-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить запрос</p>
          </div>
        ) : (
          <div className="search-results">
            <div className="search-results-header">
              <h2>Найдено треков: {tracks.length}</h2>
            </div>
            <div className="search-results-list">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`search-result-item ${isPlaying && currentTrack?.id === track.id ? 'playing' : ''}`}
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="search-result-number">
                    {isPlaying && currentTrack?.id === track.id ? (
                      <div className="search-result-playing-indicator">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      </div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className="search-result-cover">
                    {MusicService.getCoverUrl(track) ? (
                      <img
                        src={MusicService.getCoverUrl(track)}
                        alt={`${track.artist} - ${track.title}`}
                      />
                    ) : (
                      <div className="search-result-cover-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="search-result-info">
                    <div className="search-result-title">{track.title}</div>
                    <div className="search-result-artist">{track.artist}</div>
                  </div>

                  <div className="search-result-duration">{formatDuration(track.duration)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

