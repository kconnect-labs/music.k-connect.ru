import axios from 'axios';
import { Track } from './MusicService';

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  cover_url?: string;
  cover_image?: string;
  track_count?: number;
  tracks_count?: number;
  tracks?: Track[];
  created_at?: string;
  updated_at?: string;
  owner?: {
    id: number;
    name?: string;
    username: string;
    avatar_url?: string;
  };
  is_owner?: boolean;
}

export interface PlaylistResponse {
  success: boolean;
  playlists?: Playlist[];
  playlist?: Playlist;
  total?: number;
  pages?: number;
  current_page?: number;
  message?: string;
  error?: string;
}

class PlaylistService {
  private getAuthHeaders() {
    return {
      withCredentials: true,
    };
  }

  async getUserPlaylists(): Promise<PlaylistResponse> {
    try {
      const response = await axios.get('/api/music/playlists', this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  }

  async getPlaylist(playlistId: number): Promise<PlaylistResponse> {
    try {
      const response = await axios.get(`/api/music/playlists/${playlistId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw error;
    }
  }

  async getPublicPlaylists(page: number = 1, perPage: number = 20): Promise<PlaylistResponse> {
    try {
      const response = await axios.get(
        `/api/music/playlists/public?page=${page}&per_page=${perPage}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching public playlists:', error);
      throw error;
    }
  }

  async createPlaylist(name: string, description?: string, isPublic: boolean = false, coverImage?: File): Promise<PlaylistResponse> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }
      formData.append('is_public', String(isPublic));
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const response = await axios.post('/api/music/playlists', formData, {
        ...this.getAuthHeaders(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async updatePlaylist(
    playlistId: number,
    name?: string,
    description?: string,
    isPublic?: boolean,
    coverImage?: File
  ): Promise<PlaylistResponse> {
    try {
      const formData = new FormData();
      if (name) {
        formData.append('name', name);
      }
      if (description !== undefined) {
        formData.append('description', description);
      }
      if (isPublic !== undefined) {
        formData.append('is_public', String(isPublic));
      }
      if (coverImage) {
        formData.append('cover_image', coverImage);
      }

      const response = await axios.put(`/api/music/playlists/${playlistId}`, formData, {
        ...this.getAuthHeaders(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  }

  async deletePlaylist(playlistId: number): Promise<PlaylistResponse> {
    try {
      const response = await axios.delete(`/api/music/playlists/${playlistId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  }
}

export default new PlaylistService();

