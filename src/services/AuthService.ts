import axios from 'axios';

const AuthService = {
  login: async (credentials: { usernameOrEmail: string; password: string }) => {
    try {
      const { usernameOrEmail, password } = credentials;
      const response = await axios.post(
        '/api/auth/login',
        {
          username: usernameOrEmail,
          password,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.ban_info) {
        return {
          success: false,
          error: response.data.error || 'Аккаунт заблокирован',
          ban_info: response.data.ban_info,
        };
      }

      if (response.data && response.data.success) {
        return {
          success: true,
          user: response.data.user || null,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Неизвестная ошибка при входе',
        };
      }
    } catch (error: any) {
      if (error.response?.data?.ban_info) {
        return {
          success: false,
          error: error.response.data.error || 'Аккаунт заблокирован',
          ban_info: error.response.data.ban_info,
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при входе в систему',
      };
    }
  },

  checkAuth: async () => {
    try {
      try {
        const response = await axios.get('/api/auth/check', {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (
          response.data &&
          response.data.sessionExists &&
          !response.data.user
        ) {
          response.data.hasSession = true;
          response.data.isAuthenticated = false;
        }

        if (
          response.data &&
          response.data.needsProfileSetup &&
          response.data.sessionExists
        ) {
          response.data.hasSession = true;
          response.data.isAuthenticated = false;
        }

        return response;
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          const fallbackResponse = await axios.get('/api/check-auth', {
            withCredentials: true,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });

          if (
            fallbackResponse.data &&
            fallbackResponse.data.sessionExists &&
            !fallbackResponse.data.user
          ) {
            fallbackResponse.data.hasSession = true;
            fallbackResponse.data.isAuthenticated = false;
          }

          if (
            fallbackResponse.data &&
            fallbackResponse.data.needsProfileSetup &&
            fallbackResponse.data.sessionExists
          ) {
            fallbackResponse.data.hasSession = true;
            fallbackResponse.data.isAuthenticated = false;
          }

          return fallbackResponse;
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error checking auth status:', error);
      const errorResponse = {
        data: {
          isAuthenticated: false,
          user: null,
          hasSession: false,
          error: error.response?.data?.error || error.message,
        },
      };
      return errorResponse;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(
        '/api/auth/logout',
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default AuthService;

