import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import MusicService from '../../services/MusicService';
import './MyVibeWidget.css';

const generateTrackColors = (trackTitle?: string) => {
  if (!trackTitle) {
    return {
      bass: 'rgba(110, 23, 23, 0.9)',
      mid: 'rgba(179, 30, 30, 0.7)',
      treble: 'rgba(202, 28, 28, 0.5)',
    };
  }

  let mainHash = 0;
  let secondaryHash = 0;

  for (let i = 0; i < trackTitle.length; i++) {
    const char = trackTitle.charCodeAt(i);
    mainHash = ((mainHash << 5) - mainHash) + char;
    secondaryHash = ((secondaryHash << 3) - secondaryHash) + char * (i + 1);
    mainHash = mainHash & mainHash;
    secondaryHash = secondaryHash & secondaryHash;
  }

  const timeFactor = 25;
  const positionFactor = trackTitle.split('').reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1);
  }, 0);

  const baseHue = (Math.abs(mainHash) + timeFactor + positionFactor) % 360;
  const dynamicHue = (baseHue + 12) % 360;

  const createColor = (
    hue: number,
    baseSaturation: number,
    baseLightness: number,
    alpha: number,
    hueShift: number = 0,
    satShift: number = 0,
    lightShift: number = 0
  ) => {
    const finalHue = (hue + hueShift) % 360;
    const saturation = Math.max(65, Math.min(85, baseSaturation + satShift));
    const lightness = Math.max(40, Math.min(65, baseLightness + lightShift));
    return `hsla(${finalHue}, ${saturation}%, ${lightness}%, ${alpha})`;
  };

  const bassHueShift = 5;
  const midHueShift = 3;
  const trebleHueShift = 7;
  const satVariation = 4;
  const lightVariation = 3;

  return {
    bass: createColor(dynamicHue, 80, 45, 0.9, bassHueShift, satVariation + 5, lightVariation - 5),
    mid: createColor(dynamicHue, 75, 55, 0.7, midHueShift, satVariation, lightVariation),
    treble: createColor(dynamicHue, 70, 65, 0.5, trebleHueShift, satVariation - 3, lightVariation + 5),
  };
};

const WaveContainer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { currentTrack } = useMusic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getWaveData = () => {
      if (!isPlaying) {
        return { bass: 0, mid: 0, treble: 0, overall: 0 };
      }

      const progressIntensity = 0.8;
      const kickBeat = 0.6;
      const snareBeat = 0.4;
      const hihatBeat = 0.3;
      const beat1 = 0.7;
      const beat2 = 0.8;
      const beat3 = 0.85;

      const bass = Math.max(beat1 * 0.8, beat2 * 0.6) * progressIntensity + (kickBeat * 0.4);
      const mid = Math.max(beat1 * 0.6, beat2 * 0.8, beat3 * 0.4) * progressIntensity + (snareBeat * 0.3);
      const treble = Math.max(beat2 * 0.4, beat3 * 0.9) * progressIntensity + (hihatBeat * 0.2);
      const overall = (bass + mid + treble) / 3;

      return { bass, mid, treble, overall };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        const time = Date.now() * 0.001;
        const canvasWidth = canvas.width / window.devicePixelRatio;
        const canvasHeight = canvas.height / window.devicePixelRatio;

        const waveData = getWaveData();
        const { bass, mid, treble } = waveData;
        const trackColors = generateTrackColors(currentTrack?.title);

        const waves = [
          {
            intensity: bass,
            baseHeight: canvasHeight * 0.25,
            color: trackColors.bass,
            frequency: 0.012,
            amplitude: 20,
          },
          {
            intensity: mid,
            baseHeight: canvasHeight * 0.45,
            color: trackColors.mid,
            frequency: 0.01,
            amplitude: 25,
          },
          {
            intensity: treble,
            baseHeight: canvasHeight * 0.65,
            color: trackColors.treble,
            frequency: 0.008,
            amplitude: 30,
          },
        ];

        waves.forEach((wave, waveIndex) => {
          ctx.beginPath();
          const dynamicAmplitude = wave.amplitude * (0.4 + wave.intensity * 2.2);
          const dynamicFreq = wave.frequency * (0.7 + wave.intensity * 1.2);

          ctx.moveTo(0, canvasHeight);

          for (let x = 0; x <= canvasWidth; x += 0.5) {
            const wave1 = Math.sin((x * dynamicFreq) + (time * (0.8 + waveIndex * 0.2))) * dynamicAmplitude;
            const wave2 = Math.sin((x * dynamicFreq * 1.3) + (time * (1.1 + waveIndex * 0.15))) * (dynamicAmplitude * 0.4);
            const wave3 = Math.sin((x * dynamicFreq * 0.8) + (time * (0.6 + waveIndex * 0.1))) * (dynamicAmplitude * 0.3);

            const y = wave.baseHeight + wave1 + wave2 + wave3;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(canvasWidth, canvasHeight);
          ctx.closePath();

          const gradient = ctx.createLinearGradient(0, wave.baseHeight, 0, canvasHeight);
          gradient.addColorStop(0, wave.color);
          gradient.addColorStop(0.2, wave.color.replace(/[\d.]+\)$/g, '0.8)'));
          gradient.addColorStop(0.4, wave.color.replace(/[\d.]+\)$/g, '0.6)'));
          gradient.addColorStop(0.7, wave.color.replace(/[\d.]+\)$/g, '0.3)'));
          gradient.addColorStop(1, wave.color.replace(/[\d.]+\)$/g, '0.05)'));

          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.strokeStyle = wave.color;
          ctx.lineWidth = 3;
          ctx.stroke();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  return (
    <div className="wave-container">
      <canvas
        ref={canvasRef}
        className="wave-canvas"
      />
    </div>
  );
};

const StaticParticles: React.FC = () => {
  const particles = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const count = isMobile || isLowEnd ? 5 : 8;

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 1.5 + 0.8,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 3,
    }));
  }, []);

  return (
    <div className="static-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const MyVibeWidget: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay, currentSection } = useMusic();
  const [isLoading, setIsLoading] = useState(false);
  const isVibePlaying = isPlaying && currentSection === 'my-vibe';
  const showCurrentTrack = isVibePlaying && currentTrack;

  const handleClick = async () => {
    if (isVibePlaying) {
      togglePlay();
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await MusicService.getMyVibe();
      if (response.success && response.tracks && response.tracks.length > 0) {
        const firstTrack = response.tracks[0];
        playTrack(firstTrack, 'my-vibe');
      } else {
        console.error('No tracks found in my vibe');
      }
    } catch (error) {
      console.error('Failed to fetch my vibe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`my-vibe-widget ${showCurrentTrack ? 'has-current-track' : ''} ${isVibePlaying ? 'playing' : ''}`}
      onClick={handleClick}
    >
      {isVibePlaying && <WaveContainer isPlaying={isVibePlaying} />}
      {!isVibePlaying && <StaticParticles />}

      <div className="my-vibe-content">
        <h2 className="my-vibe-title">Мой Вайб</h2>
        <button className="my-vibe-play-button" disabled={isLoading}>
          {isLoading ? (
            <span className="loading-spinner" />
          ) : isVibePlaying ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
      </div>

      {showCurrentTrack && (
        <div className="my-vibe-track-info">
          <span className="my-vibe-track-name">
            {currentTrack.title} - {currentTrack.artist}
          </span>
        </div>
      )}
    </div>
  );
};

export default MyVibeWidget;

