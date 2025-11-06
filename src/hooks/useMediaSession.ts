import { useEffect } from 'react';
import { Track } from '../services/MusicService';
import MusicService from '../services/MusicService';

interface UseMediaSessionProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeekTo?: (time: number) => void;
  positionState?: {
    duration: number;
    playbackRate: number;
    position: number;
  };
}

/**
 * Хук для управления Media Session API (нативные контролы на мобильных устройствах)
 */
export const useMediaSession = ({
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeekTo,
  positionState,
}: UseMediaSessionProps) => {
  useEffect(() => {
    // Проверяем поддержку Media Session API
    if (!('mediaSession' in navigator)) {
      return;
    }

    const mediaSession = navigator.mediaSession;

    // Обновляем метаданные трека
    if (currentTrack) {
      const coverUrl = MusicService.getCoverUrl(currentTrack);
      
      mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: '', // Альбом не хранится в Track интерфейсе
        artwork: coverUrl
          ? [
              // Различные размеры обложки для разных устройств
              { src: coverUrl, sizes: '96x96', type: 'image/jpeg' },
              { src: coverUrl, sizes: '128x128', type: 'image/jpeg' },
              { src: coverUrl, sizes: '192x192', type: 'image/jpeg' },
              { src: coverUrl, sizes: '256x256', type: 'image/jpeg' },
              { src: coverUrl, sizes: '384x384', type: 'image/jpeg' },
              { src: coverUrl, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [],
      });
    } else {
      // Очищаем метаданные если трек не выбран
      mediaSession.metadata = null;
    }

    // Устанавливаем состояние воспроизведения
    mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Устанавливаем позицию воспроизведения (для поддержки seek)
    // Обновляем позицию отдельно, чтобы не вызывать полную перерисовку при изменении времени
    if (positionState && positionState.duration > 0 && 'setPositionState' in mediaSession) {
      try {
        mediaSession.setPositionState({
          duration: positionState.duration,
          playbackRate: positionState.playbackRate,
          position: positionState.position,
        });
      } catch (error) {
        // Не все браузеры поддерживают setPositionState
        console.warn('Media Session setPositionState not supported:', error);
      }
    } else if ('setPositionState' in mediaSession) {
      // Очищаем позицию если трек не загружен
      try {
        mediaSession.setPositionState(null as any);
      } catch (error) {
        // Игнорируем ошибки очистки
      }
    }

    // Обработчики действий
    try {
      mediaSession.setActionHandler('play', () => {
        onPlay();
      });

      mediaSession.setActionHandler('pause', () => {
        onPause();
      });

      if (onNext) {
        mediaSession.setActionHandler('nexttrack', () => {
          onNext();
        });
      } else {
        mediaSession.setActionHandler('nexttrack', null);
      }

      if (onPrevious) {
        mediaSession.setActionHandler('previoustrack', () => {
          onPrevious();
        });
      } else {
        mediaSession.setActionHandler('previoustrack', null);
      }

      // Дополнительные действия (опционально)
      mediaSession.setActionHandler('seekbackward', (details) => {
        // Можно добавить логику перемотки назад
        console.log('Seek backward', details.seekOffset);
      });

      mediaSession.setActionHandler('seekforward', (details) => {
        // Можно добавить логику перемотки вперед
        console.log('Seek forward', details.seekOffset);
      });

      if (onSeekTo) {
        mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            onSeekTo(details.seekTime);
          }
        });
      } else {
        mediaSession.setActionHandler('seekto', null);
      }
    } catch (error) {
      // Некоторые браузеры могут не поддерживать все действия
      console.warn('Error setting media session action handlers:', error);
    }

    // Очистка при размонтировании
    return () => {
      try {
        mediaSession.metadata = null;
        mediaSession.playbackState = 'none';
      } catch (error) {
        console.warn('Error clearing media session:', error);
      }
    };
  }, [currentTrack, isPlaying, onPlay, onPause, onNext, onPrevious, onSeekTo]);

  // Обновляем позицию отдельно, чтобы не вызывать полную перерисовку метаданных
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    const mediaSession = navigator.mediaSession;
    
    if (positionState && positionState.duration > 0 && 'setPositionState' in mediaSession) {
      try {
        mediaSession.setPositionState({
          duration: positionState.duration,
          playbackRate: positionState.playbackRate,
          position: positionState.position,
        });
      } catch (error) {
        // Игнорируем ошибки обновления позиции
      }
    }
  }, [positionState]);
};

