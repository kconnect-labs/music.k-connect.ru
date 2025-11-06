import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import MusicService from '../services/MusicService';
import './TrackPage.css';

const TrackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, currentTrack } = useMusic();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAndPlayTrack = async () => {
      if (!id) {
        setError('ID трека не указан');
        setLoading(false);
        return;
      }

      // Проверяем, что ID является числом (для роута /:id)
      if (!/^\d+$/.test(id)) {
        // Если это не число, это не трек - перенаправляем на главную
        navigate('/', { replace: true });
        return;
      }

      const trackId = parseInt(id, 10);
      if (isNaN(trackId)) {
        setError('Неверный ID трека');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await MusicService.getTrackById(trackId);
        
        if (response.success && response.track) {
          // Воспроизводим трек только если он еще не играет
          if (!currentTrack || currentTrack.id !== response.track.id) {
            playTrack(response.track, 'track');
          }
          // Перенаправляем на главную страницу после загрузки
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        } else {
          setError('Трек не найден');
        }
      } catch (err) {
        console.error('Error loading track:', err);
        setError('Ошибка при загрузке трека');
      } finally {
        setLoading(false);
      }
    };

    loadAndPlayTrack();
  }, [id, playTrack, currentTrack, navigate]);

  if (loading) {
    return (
      <div className="track-page">
        <div className="track-page-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка трека...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track-page">
        <div className="track-page-error">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="track-page-back-btn">
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // После загрузки и воспроизведения перенаправляем на главную
  // или можно оставить на странице, если нужно показать информацию о треке
  return null;
};

export default TrackPage;

