import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import MusicService, { Track } from '../services/MusicService';
import { useMediaSession } from '../hooks/useMediaSession';

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  currentSection: string;
  playTrack: (track: Track, section?: string) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  likeTrack: (trackId: number) => Promise<void>;
  playNextTrack: () => Promise<void>;
  playPreviousTrack: () => Promise<void>;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState('all');
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 1000; // Обновляем currentTime раз в секунду

    const updateTime = () => {
      if (!audio || audio.paused) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        return;
      }

      const now = Date.now();
      // Обновляем state только раз в секунду для уменьшения ререндеров
      if (now - lastUpdateTime >= UPDATE_INTERVAL) {
        setCurrentTime(audio.currentTime);
        lastUpdateTime = now;
      }
      // Продолжаем обновление через requestAnimationFrame для плавности
      rafId = requestAnimationFrame(updateTime);
    };

    const handleTimeUpdate = () => {
      // Запускаем requestAnimationFrame только если не запущен и аудио играет
      if (!rafId && !audio.paused) {
        rafId = requestAnimationFrame(updateTime);
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handlePlay = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateTime);
      }
    };

    const handlePause = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isPlaying]);

  const playTrack = useCallback((track: Track, section: string = 'all') => {
    const audio = audioRef.current;
    const trackUrl = MusicService.getTrackUrl(track);

    if (!trackUrl) {
      console.error('Track URL is empty');
      return;
    }

    if (currentTrack?.id === track.id && isPlaying) {
      return;
    }

    setIsLoading(true);
    setCurrentTrack(track);
    setCurrentSection(section);
    audio.src = trackUrl;
    audio.load();

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error playing track:', error);
        setIsLoading(false);
        setIsPlaying(false);
      });
  }, [currentTrack, isPlaying]);

  const pauseTrack = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing track:', error);
        });
    }
  }, [currentTrack, isPlaying]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    audioRef.current.volume = clampedVolume;
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!isNaN(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration));
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const likeTrack = useCallback(async (trackId: number) => {
    try {
      await MusicService.likeTrack(trackId);
      if (currentTrack?.id === trackId) {
        setCurrentTrack({
          ...currentTrack,
          is_liked: !currentTrack.is_liked,
        });
      }
    } catch (error) {
      console.error('Error liking track:', error);
    }
  }, [currentTrack]);

  const playNextTrack = useCallback(async () => {
    if (!currentTrack) return;
    
    try {
      const response = await MusicService.getNextTrack(currentTrack.id, currentSection);
      if (response.success && response.track) {
        playTrack(response.track, currentSection);
      }
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  }, [currentTrack, currentSection, playTrack]);

  const playPreviousTrack = useCallback(async () => {
    if (!currentTrack) return;
    
    try {
      const response = await MusicService.getPreviousTrack(currentTrack.id, currentSection);
      if (response.success && response.track) {
        playTrack(response.track, currentSection);
      }
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  }, [currentTrack, currentSection, playTrack]);

  // Используем Media Session API для нативных контролов на мобильных устройствах
  useMediaSession({
    currentTrack,
    isPlaying,
    onPlay: togglePlay,
    onPause: pauseTrack,
    onNext: playNextTrack,
    onPrevious: playPreviousTrack,
    onSeekTo: seekTo,
    positionState: duration > 0
      ? {
          duration,
          playbackRate: 1.0,
          position: currentTime,
        }
      : undefined,
  });

  const value: MusicContextType = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    currentSection,
    playTrack,
    pauseTrack,
    togglePlay,
    setVolume,
    seekTo,
    likeTrack,
    playNextTrack,
    playPreviousTrack,
    audioRef,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

