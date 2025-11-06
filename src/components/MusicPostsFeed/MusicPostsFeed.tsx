import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostService, { Post } from '../../services/PostService';
import { useMusic } from '../../context/MusicContext';
import { PlayIcon, PauseIcon } from '../icons/CustomIcons';
import './MusicPostsFeed.css';

const MusicPostsFeed: React.FC = () => {
  const { playTrack, isPlaying, currentTrack } = useMusic();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoading(true);
      }

      const response = await PostService.getPostsWithMusic(page, 10);

      if (response.success && response.posts) {
        if (append) {
          setPosts((prev) => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }
        setHasMore(response.has_next);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setCurrentPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchPosts(nextPage, true);
            return nextPage;
          });
        }
      },
      {
        threshold: 0.5,
        rootMargin: '100px',
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
  }, [hasMore, isLoading, fetchPosts]);

  const handlePlayTrack = useCallback(
    (track: any) => {
      if (isPlaying && currentTrack?.id === track.id) {
        return;
      }
      playTrack(track, 'feed');
    },
    [isPlaying, currentTrack, playTrack]
  );

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'только что';
      if (minutes < 60) return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`;
      if (hours < 24) return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`;
      if (days < 7) return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`;
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="music-posts-feed">
        <div className="music-posts-feed-loading">
          <div className="loading-spinner-large" />
          <p>Загрузка постов...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="music-posts-feed">
      <div className="music-posts-feed-list">
        {posts.map((post) => {
          if (!post.music || !Array.isArray(post.music) || post.music.length === 0) {
            return null;
          }

          return (
            <div key={post.id} className="music-post-card">
              <div className="music-post-card-header">
                <div className="music-post-card-user">
                  {post.user.avatar_url ? (
                    <img
                      src={post.user.avatar_url}
                      alt={post.user.name}
                      className="music-post-card-avatar"
                    />
                  ) : (
                    <div className="music-post-card-avatar-placeholder">
                      {post.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="music-post-card-user-info">
                    <div className="music-post-card-user-name">{post.user.name || post.user.username}</div>
                    <div className="music-post-card-time">{formatTime(post.timestamp)}</div>
                  </div>
                </div>
              </div>

              {post.content && (
                <div className="music-post-card-content">{post.content}</div>
              )}

              <div className="music-post-card-music">
                {post.music.map((track, index) => (
                  <div
                    key={track.id || index}
                    className={`music-post-card-track ${isPlaying && currentTrack?.id === track.id ? 'playing' : ''}`}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="music-post-card-track-cover">
                      {track.cover_path ? (
                        <img
                          src={track.cover_path}
                          alt={`${track.artist} - ${track.title}`}
                        />
                      ) : (
                        <div className="music-post-card-track-cover-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="music-post-card-track-info">
                      <div className="music-post-card-track-title">{track.title}</div>
                      <div className="music-post-card-track-artist">{track.artist}</div>
                    </div>
                    <button
                      className="music-post-card-track-play"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(track);
                      }}
                      aria-label={isPlaying && currentTrack?.id === track.id ? 'Пауза' : 'Воспроизвести'}
                    >
                      {isPlaying && currentTrack?.id === track.id ? (
                        <PauseIcon size={20} color="#ffffff" />
                      ) : (
                        <PlayIcon size={20} color="#ffffff" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="music-posts-feed-trigger">
          {isLoading && (
            <div className="loading-spinner-large" />
          )}
        </div>
      )}
    </div>
  );
};

export default MusicPostsFeed;

