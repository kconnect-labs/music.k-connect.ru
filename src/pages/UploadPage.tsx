import React, { useState, useCallback, useRef } from 'react';
import { PageHeader } from '../UI';
import UploadService, { TrackMetadata } from '../services/UploadService';
import './UploadPage.css';

const GENRES = [
  'рэп',
  'бодрое',
  'грустное',
  'весёлое',
  'спокойное',
  'поп',
  'электроника',
];

interface TrackData {
  file: File | null;
  coverFile: File | null;
  coverPreview: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  description: string;
  duration: number;
  metadata: {
    fileFormat: string;
    sampleRate: number;
    bitDepth: number;
    channels: number;
    fileSize: number;
  };
}

const UploadPage: React.FC = () => {
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const createEmptyTrack = (): TrackData => ({
    file: null,
    coverFile: null,
    coverPreview: '',
    title: '',
    artist: '',
    album: '',
    genre: '',
    description: '',
    duration: 0,
    metadata: {
      fileFormat: '',
      sampleRate: 0,
      bitDepth: 0,
      channels: 0,
      fileSize: 0,
    },
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const filesToProcess = selectedFiles.slice(0, 10);

    if (selectedFiles.length > 10) {
      setError('Максимальное количество треков для загрузки: 10. Первые 10 файлов были выбраны.');
    } else {
      setError('');
    }

    setIsLoadingMetadata(true);

    const newTracks: TrackData[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith('audio/')) {
        console.warn(`Файл ${file.name} не является аудио и будет пропущен`);
        continue;
      }

      const track = createEmptyTrack();
      track.file = file;

      try {
        const metadataResponse = await UploadService.extractMetadata(file);
        if (metadataResponse.success && metadataResponse.metadata) {
          const metadata = metadataResponse.metadata;
          track.title = metadata.title || '';
          track.artist = metadata.artist || '';
          track.album = metadata.album || '';
          track.genre = metadata.genre || '';
          track.duration = metadata.duration || 0;
          track.metadata = {
            fileFormat: metadata.file_format || '',
            sampleRate: metadata.sample_rate || 0,
            bitDepth: metadata.bit_depth || 0,
            channels: metadata.channels || 0,
            fileSize: metadata.file_size || 0,
          };

          if (metadata.cover_data) {
            track.coverPreview = metadata.cover_data;
            try {
              const base64Response = await fetch(metadata.cover_data);
              const blob = await base64Response.blob();
              const coverFile = new File(
                [blob],
                'cover.' + (metadata.cover_mime?.split('/')[1] || 'jpg'),
                { type: metadata.cover_mime || 'image/jpeg' }
              );
              track.coverFile = coverFile;
            } catch (e) {
              console.error('Ошибка при создании файла обложки из base64:', e);
            }
          }
        } else {
          // Если метаданные не извлечены, пытаемся извлечь из имени файла
          const fileName = file.name.replace(/\.[^/.]+$/, '');
          if (fileName.includes(' - ')) {
            const parts = fileName.split(' - ');
            track.artist = parts[0].trim();
            track.title = parts[1].trim();
          } else {
            track.title = fileName;
          }

          // Получаем длительность из аудио элемента
          try {
            const objectUrl = URL.createObjectURL(file);
            const audioElement = new Audio();
            await new Promise<void>((resolve) => {
              audioElement.onloadedmetadata = () => {
                track.duration = Math.round(audioElement.duration);
                URL.revokeObjectURL(objectUrl);
                resolve();
              };
              audioElement.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve();
              };
              audioElement.src = objectUrl;
            });
          } catch (e) {
            console.error('Ошибка при получении длительности аудио:', e);
          }
        }
      } catch (error) {
        console.error('Ошибка при извлечении метаданных:', error);
        // Создаем трек с базовыми данными из имени файла
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        track.title = fileName;
      }

      newTracks.push(track);
    }

    if (newTracks.length > 0) {
      setTracks(newTracks);
      setCurrentTrackIndex(0);
      coverInputRefs.current = new Array(newTracks.length).fill(null);
    }

    setIsLoadingMetadata(false);
  }, []);

  const handleCoverChange = useCallback((index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Выберите изображение для обложки');
      return;
    }

    const updatedTracks = [...tracks];
    updatedTracks[index].coverFile = selectedFile;
    updatedTracks[index].coverPreview = URL.createObjectURL(selectedFile);
    setTracks(updatedTracks);
    setError('');
  }, [tracks]);

  const handleTrackChange = useCallback((index: number, field: keyof TrackData, value: string | number) => {
    const updatedTracks = [...tracks];
    (updatedTracks[index] as any)[field] = value;
    setTracks(updatedTracks);
  }, [tracks]);

  const handleRemoveTrack = useCallback((index: number) => {
    const updatedTracks = [...tracks];
    
    // Очищаем URL превью обложки
    if (updatedTracks[index].coverPreview && updatedTracks[index].coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(updatedTracks[index].coverPreview);
    }
    
    updatedTracks.splice(index, 1);
    setTracks(updatedTracks);
    coverInputRefs.current.splice(index, 1);

    if (currentTrackIndex >= updatedTracks.length) {
      setCurrentTrackIndex(Math.max(0, updatedTracks.length - 1));
    }
  }, [tracks, currentTrackIndex]);

  const handleSubmit = useCallback(async () => {
    const invalidTrackIndex = tracks.findIndex(track => {
      return !track.file || !track.title || !track.artist || !track.coverFile;
    });

    if (invalidTrackIndex !== -1) {
      setCurrentTrackIndex(invalidTrackIndex);
      setError('Заполните все обязательные поля для всех треков (файл, название, исполнитель, обложка)');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);
    setUploadProgress(0);

    try {
      const uploadData = tracks.map(track => ({
        file: track.file!,
        coverFile: track.coverFile!,
        title: track.title,
        artist: track.artist,
        album: track.album,
        genre: track.genre,
        description: track.description,
        duration: track.duration,
      }));

      const response = await UploadService.uploadTracks(uploadData);

      if (response.success) {
        setSuccess(true);
        setUploadProgress(100);

        if (response.errors && response.errors.length > 0) {
          setError('Некоторые треки не были загружены: ' + response.errors.join(', '));
        }

        // Очищаем форму через 2 секунды
        setTimeout(() => {
          setTracks([]);
          setCurrentTrackIndex(0);
          setSuccess(false);
          setError('');
          setUploadProgress(0);
        }, 2000);
      } else {
        setError(response.error || response.message || 'Ошибка при загрузке треков');
      }
    } catch (error: any) {
      console.error('Ошибка при загрузке треков:', error);
      setError('Ошибка при загрузке треков');
    } finally {
      setIsLoading(false);
    }
  }, [tracks]);

  const handleAddMoreTracks = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="upload-page">
      <div className="upload-container">
        <PageHeader
          title="Загрузка треков"
          subtitle={tracks.length > 0 ? `${tracks.length} ${tracks.length === 1 ? 'трек' : tracks.length < 5 ? 'трека' : 'треков'}` : 'Выберите файлы для загрузки'}
        />

        {tracks.length === 0 ? (
          <div className="upload-empty">
            <div className="upload-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileChange}
                disabled={isLoadingMetadata}
                style={{ display: 'none' }}
              />
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <h3>Выберите музыкальные файлы</h3>
              <p>Поддерживаются форматы MP3, FLAC, WAV, OGG и другие</p>
              <p className="upload-dropzone-hint">Можно выбрать до 10 файлов одновременно</p>
              <button
                className="upload-select-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoadingMetadata}
              >
                {isLoadingMetadata ? 'Загрузка...' : 'Выбрать файлы'}
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            {/* Список треков слева */}
            <div className="upload-tracks-list">
              <div className="upload-tracks-list-header">
                <h3>Треки ({tracks.length}/10)</h3>
                {tracks.length < 10 && (
                  <button
                    className="upload-add-button"
                    onClick={handleAddMoreTracks}
                    disabled={isLoadingMetadata}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Добавить
                  </button>
                )}
              </div>
              <div className="upload-tracks-list-content">
                {tracks.map((track, index) => (
                  <div
                    key={index}
                    className={`upload-track-item ${index === currentTrackIndex ? 'active' : ''}`}
                    onClick={() => setCurrentTrackIndex(index)}
                  >
                    <div className="upload-track-item-cover">
                      {track.coverPreview ? (
                        <img src={track.coverPreview} alt={track.title || 'Трек'} />
                      ) : (
                        <div className="upload-track-item-cover-placeholder">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="upload-track-item-info">
                      <div className="upload-track-item-title">{track.title || 'Без названия'}</div>
                      <div className="upload-track-item-artist">{track.artist || 'Неизвестный исполнитель'}</div>
                    </div>
                    <button
                      className="upload-track-item-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(index);
                      }}
                      aria-label="Удалить трек"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Форма редактирования трека справа */}
            <div className="upload-track-form">
              {currentTrack ? (
                <>
                  <div className="upload-form-section">
                    <label className="upload-form-label">Название трека *</label>
                    <input
                      type="text"
                      className="upload-form-input"
                      value={currentTrack.title}
                      onChange={(e) => handleTrackChange(currentTrackIndex, 'title', e.target.value)}
                      placeholder="Название трека"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="upload-form-row">
                    <div className="upload-form-section">
                      <label className="upload-form-label">Исполнитель *</label>
                      <input
                        type="text"
                        className="upload-form-input"
                        value={currentTrack.artist}
                        onChange={(e) => handleTrackChange(currentTrackIndex, 'artist', e.target.value)}
                        placeholder="Исполнитель"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="upload-form-section">
                      <label className="upload-form-label">Альбом</label>
                      <input
                        type="text"
                        className="upload-form-input"
                        value={currentTrack.album}
                        onChange={(e) => handleTrackChange(currentTrackIndex, 'album', e.target.value)}
                        placeholder="Альбом"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="upload-form-section">
                    <label className="upload-form-label">Жанр</label>
                    <select
                      className="upload-form-select"
                      value={currentTrack.genre}
                      onChange={(e) => handleTrackChange(currentTrackIndex, 'genre', e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="">Не выбрано</option>
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="upload-form-section">
                    <label className="upload-form-label">Описание</label>
                    <textarea
                      className="upload-form-textarea"
                      value={currentTrack.description}
                      onChange={(e) => handleTrackChange(currentTrackIndex, 'description', e.target.value)}
                      placeholder="Описание трека"
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="upload-form-section">
                    <label className="upload-form-label">Обложка *</label>
                    <div className="upload-cover-upload">
                      {currentTrack.coverPreview ? (
                        <div className="upload-cover-preview">
                          <img src={currentTrack.coverPreview} alt="Обложка" />
                          <button
                            className="upload-cover-change"
                            onClick={() => coverInputRefs.current[currentTrackIndex]?.click()}
                            disabled={isLoading}
                          >
                            Изменить
                          </button>
                        </div>
                      ) : (
                        <div
                          className="upload-cover-placeholder"
                          onClick={() => coverInputRefs.current[currentTrackIndex]?.click()}
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>Выбрать обложку</span>
                        </div>
                      )}
                      <input
                        ref={(el) => {
                          coverInputRefs.current[currentTrackIndex] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverChange(currentTrackIndex, e)}
                        disabled={isLoading}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  {currentTrack.metadata.fileSize > 0 && (
                    <div className="upload-form-meta">
                      <div className="upload-form-meta-item">
                        <span>Размер:</span>
                        <span>{formatFileSize(currentTrack.metadata.fileSize)}</span>
                      </div>
                      {currentTrack.duration > 0 && (
                        <div className="upload-form-meta-item">
                          <span>Длительность:</span>
                          <span>{formatDuration(currentTrack.duration)}</span>
                        </div>
                      )}
                      {currentTrack.metadata.fileFormat && (
                        <div className="upload-form-meta-item">
                          <span>Формат:</span>
                          <span>{currentTrack.metadata.fileFormat}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="upload-form-actions">
                    <button
                      className="upload-submit-button"
                      onClick={handleSubmit}
                      disabled={isLoading || tracks.length === 0}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner-small" />
                          <span>Загрузка... {uploadProgress > 0 ? `${uploadProgress}%` : ''}</span>
                        </>
                      ) : success ? (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Загружено!</span>
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>Загрузить {tracks.length} {tracks.length === 1 ? 'трек' : tracks.length < 5 ? 'трека' : 'треков'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="upload-form-empty">
                  <p>Выберите трек для редактирования</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="upload-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isLoadingMetadata && (
          <div className="upload-loading-metadata">
            <div className="loading-spinner-large" />
            <p>Извлечение метаданных...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;

