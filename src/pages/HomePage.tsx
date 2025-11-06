import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../UI';
import MyVibeWidget from '../components/MyVibeWidget/MyVibeWidget';
import MusicPostsFeed from '../components/MusicPostsFeed/MusicPostsFeed';
import { useMusic } from '../context/MusicContext';
import MusicService, { Track } from '../services/MusicService';
import { getRandomQuote } from '../services/QuoteService';
import './HomePage.css';

// GIF-изображения для топ-5 позиций
const TOP_GIFS = [
  'Xi5e.gif',  // 1 место (было 4 место)
  '33Ho.gif',  // 2 место (было 1 место)
  'ZNec.gif',  // 3 место (было 5 место)
  'BrxG.gif',  // 4 место (было 3 место)
  '5Mz4.gif',  // 5 место (было 2 место)
];

const HomePage: React.FC = () => {
  const { playTrack } = useMusic();
  const [newTracks, setNewTracks] = useState<Track[]>([]);
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  const fetchTracks = useCallback(async () => {
    try {
      const [newResponse, popularResponse] = await Promise.all([
        MusicService.getNewTracks(10),
        MusicService.getPopularTracks(10),
      ]);

      if (newResponse.success && newResponse.tracks) {
        setNewTracks(newResponse.tracks);
      }
      if (popularResponse.success && popularResponse.tracks) {
        setPopularTracks(popularResponse.tracks);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Загружаем цитату при монтировании компонента
  useEffect(() => {
    const loadQuote = async () => {
      const randomQuote = await getRandomQuote();
      if (randomQuote) {
        setQuote(randomQuote);
      }
    };
    loadQuote();
  }, []);

  const handlePlayTrack = useCallback(
    (track: Track) => {
      playTrack(track, 'home');
    },
    [playTrack]
  );

  return (
    <div className="home-page">
      <div className="home-container">
        <PageHeader
          title={quote ? quote.text : 'Добро пожаловать'}
          subtitle={quote ? quote.author : 'Начните слушать музыку прямо сейчас'}
        />
        
        <div className="content-container">
          <div className="left-column">
            {/* Мой Вайб - главный виджет */}
            <MyVibeWidget />
            
            {/* Лента постов с музыкой */}
            <MusicPostsFeed />
          </div>

          <div className="right-column">
            {popularTracks.length > 0 && (
              <div className="sidebar-widget">
                <h3 className="sidebar-widget-title">Топ недели</h3>
                <div className="sidebar-widget-content">
                  {popularTracks.slice(0, 5).map((track, index) => (
                    <div
                      key={track.id}
                      className="top-track-item"
                      onClick={() => handlePlayTrack(track)}
                    >
                      <div className="top-track-number">
                        <img
                          src={`https://s3.k-connect.ru/static/TopMusic/${TOP_GIFS[index]}`}
                          alt={`${index + 1} место`}
                          className="top-track-gif"
                        />
                      </div>
                      <div className="top-track-info">
                        <div className="top-track-name">{track.title}</div>
                        <div className="top-track-artist">{track.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newTracks.length > 0 && (
              <div className="sidebar-widget">
                <h3 className="sidebar-widget-title">Новые релизы</h3>
                <div className="sidebar-widget-content">
                  {newTracks.slice(0, 3).map((track) => (
                    <div
                      key={track.id}
                      className="new-release-item"
                      onClick={() => handlePlayTrack(track)}
                    >
                      <div className="new-release-cover">
                        {MusicService.getCoverUrl(track) ? (
                          <img
                            src={MusicService.getCoverUrl(track)}
                            alt={track.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                              svg.setAttribute('width', '40');
                              svg.setAttribute('height', '40');
                              svg.setAttribute('viewBox', '0 0 24 24');
                              svg.setAttribute('fill', 'none');
                              svg.setAttribute('stroke', 'currentColor');
                              svg.setAttribute('stroke-width', '2');
                              const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                              polygon.setAttribute('points', '5 3 19 12 5 21 5 3');
                              svg.appendChild(polygon);
                              (e.target as HTMLElement).parentElement?.appendChild(svg);
                            }}
                          />
                        ) : (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                      </div>
                      <div className="new-release-info">
                        <div className="new-release-name">{track.title}</div>
                        <div className="new-release-artist">{track.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

