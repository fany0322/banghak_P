import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (
  Platform.OS === 'web' 
    ? 'http://localhost:5000/api'
    : 'http://100.64.1.1:5000/api' // Android emulator default
);

export interface User {
  id: number;
  email: string;
  name: string;
  profile_image?: string;
  is_verified: boolean;
  grade?: number;
  class_num?: number;
  student_id?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  vote_score: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  parent_id?: number;
  replies?: Comment[];
}

export interface TimetableItem {
  id: number;
  subject_name: string;
  teacher_name?: string;
  classroom?: string;
}

export interface TimetableData {
  [day: string]: {
    [period: number]: TimetableItem | null;
  };
}

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  description?: string;
  due_date: string;
  grade?: number;
  author?: string;
  is_own: boolean;
  created_at: string;
}

class ApiService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response, skipAuthLogic = false) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401 && !skipAuthLogic) {
        // Token expired, try to refresh
        const refreshResult = await this.refreshToken();
        if (!refreshResult) {
          await this.logout();
          throw new Error('Authentication failed');
        }
        throw new Error('retry'); // Signal to retry the original request
      }
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });
      
      return await this.handleResponse(response);
    } catch (error: any) {
      if (error.message === 'retry') {
        // Retry once with new token
        const newHeaders = await this.getAuthHeaders();
        const response = await fetch(url, {
          ...options,
          headers: {
            ...newHeaders,
            ...options.headers,
          },
        });
        return await this.handleResponse(response);
      }
      throw error;
    }
  }

  // Authentication
  async login(googleToken: string): Promise<{ user: User; access_token: string; refresh_token: string }> {
    // For development/testing, use test endpoint if token looks like test data
    const endpoint = googleToken.startsWith('test_') || googleToken.includes('test') 
      ? '/test-auth/google-login'
      : '/auth/google-login';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: googleToken }),
    });
    
    // Skip auth logic for login requests to prevent logout loops
    const data = await this.handleResponse(response, true);
    
    // Store tokens
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  // Test login helper - send JSON directly to backend
  async testLogin(email: string, name: string): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const response = await fetch(`${API_BASE_URL}/test-auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: 'test_direct',
        email: email,
        name: name 
      }),
    });
    
    const data = await this.handleResponse(response, true);
    
    // Store tokens
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) return false;

      const data = await response.json();
      await AsyncStorage.setItem('access_token', data.access_token);
      return true;
    } catch {
      return false;
    }
  }

  private isLoggingOut = false;

  async logout(): Promise<void> {
    if (this.isLoggingOut) {
      console.log('Logout already in progress, skipping...');
      return;
    }
    
    this.isLoggingOut = true;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });
      // Don't call handleResponse to avoid logout loops
    } catch {
      // Ignore errors on logout
    } finally {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      this.isLoggingOut = false;
    }
  }

  async getProfile(): Promise<User> {
    return this.makeRequest('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<void> {
    await this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Posts
  async getPosts(page = 1, category = '', sort = 'latest'): Promise<{ posts: Post[]; pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '20',
      ...(category && { category }),
      sort,
    });
    
    const url = `/posts?${params}`;
    console.log('API request URL:', url);
    
    return this.makeRequest(url);
  }

  async getPost(postId: number): Promise<Post & { comments: Comment[] }> {
    return this.makeRequest(`/posts/${postId}`);
  }

  async createPost(data: {
    title: string;
    content: string;
    category: string;
    is_anonymous?: boolean;
  }): Promise<{ id: number }> {
    return this.makeRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async votePost(postId: number, isUpvote: boolean): Promise<{ upvotes: number; downvotes: number; vote_score: number }> {
    return this.makeRequest(`/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ is_upvote: isUpvote }),
    });
  }

  // Comments
  async getComments(postId: number): Promise<{ comments: Comment[]; total: number }> {
    return this.makeRequest(`/posts/${postId}/comments`);
  }

  async createComment(postId: number, content: string, parentId?: number): Promise<Comment> {
    return this.makeRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        is_anonymous: true,
        parent_id: parentId,
      }),
    });
  }

  // Utility methods
  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  }

  async getCurrentUser(): Promise<User | null> {
    const userString = await AsyncStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  async getMyPosts(page = 1): Promise<{ posts: Post[]; pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '20',
    });
    
    return this.makeRequest(`/my-posts?${params}`);
  }

  async getVotedPosts(page = 1): Promise<{ posts: (Post & { user_vote: string })[]; pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '20',
    });
    
    return this.makeRequest(`/voted-posts?${params}`);
  }

  // Timetable
  async getTimetable(semester = '2024-2'): Promise<{ timetable: TimetableData; semester: string }> {
    const params = new URLSearchParams({ semester });
    return this.makeRequest(`/timetable?${params}`);
  }

  async addTimetableItem(data: {
    subject_name: string;
    teacher_name?: string;
    classroom?: string;
    day_of_week: number; // 0-6
    period: number; // 1-7
    semester?: string;
  }): Promise<{ id: number; message: string }> {
    return this.makeRequest('/timetable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTimetableItem(itemId: number, data: {
    subject_name?: string;
    teacher_name?: string;
    classroom?: string;
    day_of_week?: number;
    period?: number;
  }): Promise<{ message: string }> {
    return this.makeRequest(`/timetable/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTimetableItem(itemId: number): Promise<{ message: string }> {
    return this.makeRequest(`/timetable/${itemId}`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateTimetable(data: {
    semester?: string;
    timetable: TimetableData;
  }): Promise<{ message: string }> {
    return this.makeRequest('/timetable/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Assignments
  async getAssignments(page = 1, subject = '', grade?: number, ownOnly = false): Promise<{ assignments: Assignment[]; pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '20',
      ...(subject && { subject }),
      ...(grade && { grade: grade.toString() }),
      ...(ownOnly && { own: 'true' }),
    });
    
    return this.makeRequest(`/assignments?${params}`);
  }

  async getUpcomingAssignments(): Promise<Assignment[]> {
    try {
      const result = await this.getAssignments(1);
      // 마감일이 가까운 순서로 정렬되어 있으므로 상위 몇 개만 반환
      return result.assignments.slice(0, 5);
    } catch (error) {
      console.error('Failed to get upcoming assignments:', error);
      return [];
    }
  }

  async createAssignment(data: {
    title: string;
    subject: string;
    description?: string;
    due_date: string;
    grade?: number;
    is_shared?: boolean;
  }): Promise<{ id: number; message: string }> {
    return this.makeRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCategories(): Promise<Array<{ id: number; name: string; description: string }>> {
    return this.makeRequest('/categories');
  }
}

export const apiService = new ApiService();