import api from './api';
import { useToast } from '@/hooks/use-toast';

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupData extends LoginCredentials {
  confirmPassword: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    // Add other user fields as needed
  };
}

/**
 * Service for handling authentication related API calls
 */
export const authService = {
  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      // Store the token in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      // Store the token in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    // You might want to redirect to login page here or handle it in the component
  },

  /**
   * Get the current authentication token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },

  /**
   * Get headers with authorization token
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default authService;
