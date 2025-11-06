import React, { useEffect, useRef } from 'react';
import { useMusic } from '../../context/MusicContext';
import { useDominantColor } from '../../hooks/useDominantColor';

interface TimelineProps {
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Timeline: React.FC<TimelineProps> = React.memo(({ onSeek }) => {
  const { currentTrack, audioRef, isPlaying } = useMusic();
  const { activeColor } = useDominantColor(currentTrack);
  const fillRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // Обновляем таймлайн напрямую через DOM для плавности, без ререндеров
  useEffect(() => {
    if (!fillRef.current || !currentTrack || !audioRef.current) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const audio = audioRef.current;
    const fill = fillRef.current;

    const updateTimeline = () => {
      if (!audio || !fill) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        return;
      }
      
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      
      if (duration && duration > 0) {
        const progress = (currentTime / duration) * 100;
        fill.style.width = `${progress}%`;
      }

      if (!audio.paused) {
        rafIdRef.current = requestAnimationFrame(updateTimeline);
      } else {
        rafIdRef.current = null;
      }
    };

    // Синхронизируем начальное состояние
    const duration = audio.duration;
    if (duration && duration > 0) {
      const progress = (audio.currentTime / duration) * 100;
      fill.style.width = `${progress}%`;
    }

    if (!audio.paused) {
      rafIdRef.current = requestAnimationFrame(updateTimeline);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [currentTrack, isPlaying]);

  // Обновляем цвет при изменении
  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.backgroundColor = activeColor || 'rgb(208, 188, 255)';
    }
  }, [activeColor]);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="header-timeline" onClick={onSeek}>
      <div className="header-timeline-bar">
        <div
          ref={fillRef}
          className="header-timeline-fill"
          style={{ 
            width: '0%',
            backgroundColor: activeColor || 'rgb(208, 188, 255)',
            opacity: 0.4
          }}
        />
      </div>
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;

