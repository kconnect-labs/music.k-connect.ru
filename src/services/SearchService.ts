import axios from 'axios';
import { Track } from './MusicService';

export interface SearchResponse {
  success?: boolean;
  tracks?: Track[];
  error?: string;
}

class SearchService {
  private getAuthHeaders() {
    return {
      withCredentials: true,
    };
  }

  async searchTracks(query: string): Promise<SearchResponse> {
    try {
      if (!query || query.trim().length < 2) {
        return { tracks: [] };
      }

      const response = await axios.get(`/api/music/search?query=${encodeURIComponent(query.trim())}`, this.getAuthHeaders());
      
      // API возвращает массив треков напрямую (не обернутый в объект)
      if (Array.isArray(response.data)) {
        return { tracks: response.data };
      }
      
      // Если пришел объект с tracks или error
      if (response.data && Array.isArray(response.data.tracks)) {
        return { tracks: response.data.tracks };
      }
      
      // Если ошибка в ответе
      if (response.data && response.data.error) {
        console.error('Search API error:', response.data.error);
        return { tracks: [], error: response.data.error };
      }
      
      return { tracks: [] };
    } catch (error: any) {
      console.error('Error searching tracks:', error);
      // Если ошибка сети или сервера, возвращаем пустой массив
      if (error.response?.status === 401) {
        return { tracks: [], error: 'Требуется авторизация' };
      }
      return { tracks: [] };
    }
  }
}

export default new SearchService();

