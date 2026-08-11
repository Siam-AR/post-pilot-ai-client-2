import type { ApiErrorResponse, AuthResponse, User } from "@/types";

export interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const apiCall = async <T = unknown>(
  endpoint: string,
  options: ApiCallOptions = {},
): Promise<T> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `Request failed with status ${response.status}`,
    );
  }

  return result.data as T;
};

export const authAPI = {
  register: (data: Record<string, unknown>) =>
    apiCall<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: Record<string, unknown>) =>
    apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  googleLogin: (data: Record<string, unknown>) =>
    apiCall<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getUser: () => apiCall<{ user: User }>("/auth/user"),

  updateUser: (data: Partial<User>) =>
    apiCall<{ user: User }>("/auth/user", {
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
