const API_URL = import.meta.env.VITE_API_URL || '/api';

interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: string[];
}

export interface UserFull extends User {
  active: boolean;
  created_at: string;
  last_login: string | null;
}

class AuthService {
  private tokenKey = 'origem_viva_token';
  private userKey = 'origem_viva_user';

  async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }

    const data: LoginResponse = await response.json();
    this.setToken(data.token);
    this.setUser(data.user);
    return data.user;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.roles?.includes('admin') || false;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar usuário');
    }

    const user = await response.json();
    this.setUser(user);
    return user;
  }

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
}

export const authService = new AuthService();

// User management API
export const usersApi = {
  async list(): Promise<UserFull[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || 'Erro ao listar usuários');
      } catch {
        console.error('API Error:', text);
        throw new Error('Erro ao listar usuários: ' + response.status);
      }
    }

    return response.json();
  },

  async create(data: {
    username: string;
    password: string;
    name: string;
    email: string;
    roles: string[];
  }): Promise<void> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar usuário');
    }
  },

  async update(
    id: string,
    data: {
      name: string;
      email: string;
      password?: string;
      active: boolean;
      roles: string[];
    }
  ): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar usuário');
    }
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar usuário');
    }
  },
};
