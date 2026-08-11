import type { ApiErrorResponse, AuthResponse, User } from "@/types";

export interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const buildHeaders = (options: ApiCallOptions = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiCall = async <T = unknown>(
  endpoint: string,
  options: ApiCallOptions = {},
): Promise<T> => {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `Request failed with status ${response.status}`,
    );
  }

  return result.data as T;
};

export const apiCallFull = async <T = unknown>(
  endpoint: string,
  options: ApiCallOptions = {},
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `Request failed with status ${response.status}`,
    );
  }

  return result as ApiResponse<T>;
};

export const authAPI = {
  register: (data: Record<string, unknown>) =>
    apiCallFull<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: Record<string, unknown>) =>
    apiCallFull<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleLogin: (data: Record<string, unknown>) =>
    apiCallFull<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getUser: () => apiCall<User>("/auth/me"),

  updateUser: (data: Partial<User>) =>
    apiCall<User>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export type GeneratePostInput = {
  topic: string;
  platform: "LinkedIn" | "Facebook" | "Instagram" | "X (Twitter)";
  tone: "Professional" | "Casual" | "Friendly" | "Persuasive" | "Funny";
  length: "Short" | "Medium" | "Long";
};
export const aiAPI = {
  generate: (data: GeneratePostInput) =>
    apiCall<{ content: string }>("/api/ai/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export interface SavedPost {
  _id: string;
  userId: string;
  title: string;
  shortDescription: string;
  generatedContent: string;
  platform: string;
  tone: string;
  length: string;
  imageUrl?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}
export interface MyPostsResponse {
  items: SavedPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface MyPostsQueryParams {
  search?: string;
  platform?: string;
  tone?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}
export const postsAPI = {
  create: (
    data: Omit<SavedPost, "_id" | "userId" | "createdAt" | "updatedAt">,
  ) =>
    apiCall<SavedPost>("/api/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMine: (params?: MyPostsQueryParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          query.set(key, String(value));
        }
      });
    }

    const endpoint = `/api/posts/my${query.toString() ? `?${query.toString()}` : ""}`;
    return apiCall<MyPostsResponse>(endpoint);
  },
  getById: (id: string) => apiCall<SavedPost>(`/api/posts/${id}`),
  delete: (id: string) =>
    apiCall<{ message: string }>(`/api/posts/${id}`, { method: "DELETE" }),
};
