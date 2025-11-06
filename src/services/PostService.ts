import axios from 'axios';

export interface PostUser {
  id: number;
  name: string;
  username: string;
  photo?: string;
  avatar_url?: string;
}

export interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  cover_path?: string;
  file_path?: string;
  duration?: number;
}

export interface Post {
  id: number;
  content: string;
  timestamp: string;
  type: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  user: PostUser;
  music?: MusicTrack[] | null;
  images?: string[];
  reactions_summary?: Record<string, number>;
  user_reaction?: string | null;
}

export interface PostsResponse {
  success: boolean;
  posts: Post[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

class PostService {
  private getAuthHeaders() {
    return {
      withCredentials: true,
    };
  }

  async getPostsWithMusic(page: number = 1, perPage: number = 10): Promise<PostsResponse> {
    try {
      const response = await axios.get(
        `/api/posts/with-music?page=${page}&per_page=${perPage}`,
        this.getAuthHeaders()
      );

      if (response.data.success) {
        return response.data;
      }

      return {
        success: false,
        posts: [],
        page: 1,
        per_page: perPage,
        total: 0,
        pages: 0,
        has_next: false,
        has_prev: false,
      };
    } catch (error: any) {
      console.error('Error fetching posts with music:', error);
      return {
        success: false,
        posts: [],
        page: 1,
        per_page: perPage,
        total: 0,
        pages: 0,
        has_next: false,
        has_prev: false,
      };
    }
  }
}

export default new PostService();

