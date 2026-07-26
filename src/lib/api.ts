import type { ApiErrorResponse, AuthResponse, User } from '@/types';

export interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>;
}

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  const explicitUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URL;
  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  return 'https://community-spark-server.vercel.app';
};

export const apiCall = async <T = unknown>(endpoint: string, options: ApiCallOptions = {}): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const apiBaseUrl = getApiBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = new URL(endpoint, apiBaseUrl).toString();
  const response = await fetch(url, {
    ...options,
    headers,
    mode: 'cors',
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let message = `Request failed with status ${response.status}`;

    if (contentType.includes('application/json')) {
      const error = (await response.json()) as ApiErrorResponse;
      message = error.message || message;
    } else {
      const errorText = await response.text();
      if (errorText) {
        message = errorText;
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

export const authAPI = {
  register: (data: Record<string, unknown>) => apiCall<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: Record<string, unknown>) => apiCall<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  googleLogin: (data: Record<string, unknown>) => apiCall<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getUser: () => apiCall<{ user: User }>('/auth/user'),

  updateUser: (data: Partial<User>) => apiCall<{ user: User }>('/auth/user', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};


export type GeneratePostInput = { topic: string; platform: "LinkedIn" | "Facebook" | "Instagram" | "X (Twitter)"; tone: "Professional" | "Casual" | "Friendly" | "Persuasive" | "Funny"; length: "Short" | "Medium" | "Long" };
export const aiAPI = { generate: (data: GeneratePostInput) => apiCall<{ content: string }>("/api/ai/generate", { method: "POST", body: JSON.stringify(data) }) };

export interface SavedPost { _id: string; userId: string; title: string; shortDescription: string; generatedContent: string; platform: string; tone: string; length: string; imageUrl?: string; status?: string; createdAt: string; updatedAt?: string; }
export interface MyPostsResponse { items: SavedPost[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface MyPostsQueryParams { search?: string; platform?: string; tone?: string; sort?: string; page?: number; pageSize?: number; }
export const postsAPI = {
  create: (data: Omit<SavedPost, "_id" | "userId" | "createdAt" | "updatedAt">) => apiCall<SavedPost>("/api/posts", { method: "POST", body: JSON.stringify(data) }),
  getMine: (params?: MyPostsQueryParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          query.set(key, String(value));
        }
      });
    }

    const endpoint = `/api/posts/my${query.toString() ? `?${query.toString()}` : ""}`;
    return apiCall<MyPostsResponse>(endpoint);
  },
  getById: (id: string) => apiCall<SavedPost>(`/api/posts/${id}`),
  delete: (id: string) => apiCall<{ message: string }>(`/api/posts/${id}`, { method: "DELETE" }),
};
