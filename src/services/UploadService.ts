import axios from 'axios';
import { Track } from './MusicService';

export interface TrackMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration?: number;
  file_format?: string;
  sample_rate?: number;
  bit_depth?: number;
  channels?: number;
  file_size?: number;
  cover_data?: string;
  cover_mime?: string;
}

export interface MetadataResponse {
  success: boolean;
  metadata?: TrackMetadata;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  tracks?: Track[];
  track?: Track;
  errors?: string[];
  total_uploaded?: number;
  total_errors?: number;
}

class UploadService {
  private getAuthHeaders() {
    return {
      withCredentials: true,
    };
  }

  async extractMetadata(file: File): Promise<MetadataResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/music/metadata', formData, {
        ...this.getAuthHeaders(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return { success: true, metadata: response.data.metadata };
      }

      return { success: false, error: response.data.error || 'Не удалось извлечь метаданные' };
    } catch (error: any) {
      console.error('Error extracting metadata:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка при извлечении метаданных',
      };
    }
  }

  async uploadTracks(tracks: Array<{
    file: File;
    coverFile: File;
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    description?: string;
    duration: number;
  }>): Promise<UploadResponse> {
    try {
      const formData = new FormData();

      tracks.forEach((track, index) => {
        formData.append(`file[${index}]`, track.file);
        formData.append(`cover[${index}]`, track.coverFile);
        formData.append(`title[${index}]`, track.title);
        formData.append(`artist[${index}]`, track.artist);
        formData.append(`album[${index}]`, track.album || '');
        formData.append(`genre[${index}]`, track.genre || '');
        formData.append(`description[${index}]`, track.description || '');
        formData.append(`duration[${index}]`, String(track.duration || 0));
      });

      const response = await axios.post('/api/music/upload', formData, {
        ...this.getAuthHeaders(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Можно добавить callback для прогресса
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error uploading tracks:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка при загрузке треков',
        errors: error.response?.data?.errors || [],
      };
    }
  }
}

export default new UploadService();

