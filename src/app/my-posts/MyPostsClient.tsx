"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postsAPI, type MyPostsResponse, type SavedPost } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";

const PLATFORM_OPTIONS = ["All", "LinkedIn", "Facebook", "Instagram", "X (Twitter)"];
const TONE_OPTIONS = ["All", "Professional", "Casual", "Friendly", "Persuasive", "Funny"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title" },
  { value: "updated", label: "Last updated" },
];

const defaultQuery = {
  search: "",
  platform: "All",
  tone: "All",
  sort: "newest",
  page: 1,
  pageSize: 4,
};

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
};

export default function MyPostsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { showToast } = useToast();
  const [postsResponse, setPostsResponse] = useState<MyPostsResponse | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const query = useMemo(
    () => ({
      search: searchParams.get("search") || defaultQuery.search,
      platform: searchParams.get("platform") || defaultQuery.platform,
      tone: searchParams.get("tone") || defaultQuery.tone,
      sort: searchParams.get("sort") || defaultQuery.sort,
      page: parseNumber(searchParams.get("page"), defaultQuery.page),
      pageSize: defaultQuery.pageSize,
    }),
    [searchParams],
  );

  const queryParams = useMemo(
    () => ({
      search: query.search || undefined,
      platform: query.platform !== "All" ? query.platform : undefined,
      tone: query.tone !== "All" ? query.tone : undefined,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    }),
    [query],
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const loadPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const data = await postsAPI.getMine(queryParams);
        if (isMounted) {
          setPostsResponse(data);
        }
      } catch (error) {
        if (isMounted) {
          showToast(error instanceof Error ? error.message : "Unable to load your posts.", "error");
          setPostsResponse({ items: [], total: 0, page: query.page, pageSize: query.pageSize, totalPages: 1 });
        }
      } finally {
        if (isMounted) {
          setIsLoadingPosts(false);
        }
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, queryParams, query.page, query.pageSize, showToast]);

  const updateQuery = (updates: Partial<Record<keyof typeof query, string | number | undefined>>) => {
    const nextQuery = {
      ...query,
      ...updates,
      page: query.page,
      pageSize: query.pageSize,
    };

    if (updates.search || updates.platform || updates.tone) {
      nextQuery.page = 1;
    }

    if (updates.page !== undefined) {
      nextQuery.page = Number(updates.page);
    }

    const nextQueryString = buildQueryString({
      search: nextQuery.search,
      platform: nextQuery.platform,
      tone: nextQuery.tone,
      sort: nextQuery.sort,
      page: nextQuery.page,
    });

    router.replace(`/my-posts?${nextQueryString}`);
  };

  const availablePlatforms = PLATFORM_OPTIONS;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08111c] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-10 w-48 animate-pulse rounded-full bg-white/10" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08111c] px-5 py-16 text-center text-white sm:px-8">
        <div className="max-w-xl rounded-3xl border border-white/10 bg-white/3 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8494ff]">My Posts</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Sign in to view your saved posts.</h1>
          <p className="mt-4 text-base text-slate-400">Log in to keep track of your generated content and revisit it anytime.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-xl bg-[#5067f5] px-5 py-3 font-bold">Go to login</Link>
            <Link href="/generate" className="rounded-xl border border-white/15 px-5 py-3 font-bold text-slate-200">Generate a post</Link>
          </div>
        </div>
      </main>
    );
  }

  const items = postsResponse?.items ?? [];
  const totalPages = postsResponse?.totalPages ?? 1;
  const totalItems = postsResponse?.total ?? 0;

  return (
    <main className="min-h-screen bg-[#08111c] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8494ff]">Your library</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">My Posts</h1>
          </div>
          <Link href="/generate" className="inline-flex rounded-xl bg-[#5067f5] px-5 py-3 font-bold">Create new post</Link>
        </div>

        <div className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-white/3 p-4 sm:p-6">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Search
              <input
                type="search"
                value={query.search}
                onChange={(event) => updateQuery({ search: event.target.value })}
                placeholder="Search title or content"
                className="rounded-2xl border border-white/10 bg-[#0b1423] px-4 py-3 text-white outline-none transition focus:border-[#5067f5]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Platform
              <select
                value={query.platform}
                onChange={(event) => updateQuery({ platform: event.target.value })}
                className="rounded-2xl border border-white/10 bg-[#0b1423] px-4 py-3 text-white outline-none"
              >
                {availablePlatforms.map((platformOption) => (
                  <option key={platformOption} value={platformOption}>{platformOption}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Tone
              <select
                value={query.tone}
                onChange={(event) => updateQuery({ tone: event.target.value })}
                className="rounded-2xl border border-white/10 bg-[#0b1423] px-4 py-3 text-white outline-none"
              >
                {TONE_OPTIONS.map((toneOption) => (
                  <option key={toneOption} value={toneOption}>{toneOption}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Sort
              <select
                value={query.sort}
                onChange={(event) => updateQuery({ sort: event.target.value })}
                className="rounded-2xl border border-white/10 bg-[#0b1423] px-4 py-3 text-white outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {isLoadingPosts ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/3 p-8 text-center sm:p-10">
            <h2 className="text-2xl font-bold">No matching posts found</h2>
            <p className="mt-3 text-slate-400">Try adjusting your search or filters.</p>
            <Link href="/generate" className="mt-6 inline-flex rounded-xl bg-[#5067f5] px-5 py-3 font-bold">Start generating</Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {items.map((post) => (
                <article key={post._id} className="rounded-3xl border border-white/10 bg-white/3 p-6 transition-transform hover:-translate-y-1">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-[#5067f5]/20 px-3 py-1 text-[#b5bdff]">{post.platform}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">{post.tone}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">{post.length}</span>
                    {post.status ? <span className="rounded-full bg-white/10 px-3 py-1">{post.status}</span> : null}
                  </div>
                  <h2 className="mt-4 text-2xl font-black">{post.title}</h2>
                  <p className="mt-3 line-clamp-3 text-slate-400">{post.shortDescription}</p>
                  <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <Link href={`/my-posts/${post._id}`} className="font-semibold text-[#9ba8ff]">Open post →</Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Showing {items.length} of {totalItems} posts</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span>Page {query.page} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ page: Math.max(1, query.page - 1) })}
                  disabled={query.page <= 1}
                  className="rounded-2xl bg-white/5 px-4 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >Previous</button>
                <button
                  type="button"
                  onClick={() => updateQuery({ page: Math.min(totalPages, query.page + 1) })}
                  disabled={query.page >= totalPages}
                  className="rounded-2xl bg-white/5 px-4 py-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
