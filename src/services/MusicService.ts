import axios from 'axios';

const getAudioUrl = (filePath: string): string => {
  if (!filePath) return '';

  if (filePath.startsWith('http')) {
    return filePath;
  }

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost');

  if (isLocalhost) {
    return `https://k-connect.ru${filePath}`;
  }

  return filePath;
};

export interface Track {
  id: number;
  title: string;
  artist: string;
  file_path: string;
  cover_path?: string;
  duration?: number;
  likes_count?: number;
  is_liked?: boolean;
  plays_count?: number;
}

export interface MusicResponse {
  success: boolean;
  tracks?: Track[];
  track?: Track;
  message?: string;
  likes_count?: number;
  total?: number;
  pages?: number;
  current_page?: number;
}

class MusicService {
  private getAuthHeaders() {
    return {
      withCredentials: true,
    };
  }

  async getMyVibe(): Promise<MusicResponse> {
    try {
      const response = await axios.get('/api/music/my-vibe', this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching my vibe:', error);
      throw error;
    }
  }

  async getNewTracks(limit: number = 10): Promise<MusicResponse> {
    try {
      const response = await axios.get(
        `/api/music/tracks?type=new&limit=${limit}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching new tracks:', error);
      throw error;
    }
  }

  async getPopularTracks(limit: number = 10): Promise<MusicResponse> {
    try {
      const response = await axios.get(
        `/api/music/tracks?type=popular&limit=${limit}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching popular tracks:', error);
      throw error;
    }
  }

  async likeTrack(trackId: number): Promise<MusicResponse> {
    try {
      const response = await axios.post(
        `/api/music/${trackId}/like`,
        {},
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error liking track:', error);
      throw error;
    }
  }

  async getLikedTracks(page: number = 1, perPage: number = 20): Promise<MusicResponse> {
    try {
      const response = await axios.get(
        `/api/music/liked?page=${page}&per_page=${perPage}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
      throw error;
    }
  }

  getTrackUrl(track: Track): string {
    return getAudioUrl(track.file_path);
  }

  getCoverUrl(track: Track): string {
    if (!track.cover_path) return '';
    return getAudioUrl(track.cover_path);
  }

  async getNextTrack(currentId: number, context: string = 'all'): Promise<MusicResponse> {
    try {
      const response = await axios.get(
        `/api/music/next?current_id=${currentId}&context=${encodeURIComponent(context)}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching next track:', error);
      throw error;
    }
  }

  async getPreviousTrack(currentId: number, context: string = 'all'): Promise<MusicResponse> {
    try {
      const response = await axios.get(
        `/api/music/previous?current_id=${currentId}&context=${encodeURIComponent(context)}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching previous track:', error);
      throw error;
    }
  }

  async getTrackById(trackId: number): Promise<MusicResponse> {
    try {
      const response = await axios.get(
        `/api/music/${trackId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching track by ID:', error);
      throw error;
    }
  }
}

export default new MusicService();

