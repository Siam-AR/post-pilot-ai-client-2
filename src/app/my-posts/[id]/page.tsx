"use client";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { postsAPI, SavedPost } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { buildLoginRedirectUrl } from "@/lib/auth-redirect";

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [post, setPost] = useState<SavedPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(buildLoginRedirectUrl(pathname));
      return;
    }

    if (authLoading) {
      return;
    }

    let isMounted = true;

    postsAPI
      .getById(id)
      .then((response) => {
        if (isMounted) setPost(response);
      })
      .catch(() => {
        if (isMounted) setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, authLoading, isAuthenticated, pathname, router]);

  useEffect(() => {
    if (!post) return;

    let isMounted = true;
    postsAPI
      .getMine({ platform: post.platform, tone: post.tone, pageSize: 4 })
      .then((response) => {
        if (!isMounted) return;
        setRelatedPosts(
          response.items.filter((item) => item._id !== post._id).slice(0, 3),
        );
      })
      .catch(() => {
        if (isMounted) setRelatedPosts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [post]);

  const deletePost = async () => {
    if (!post) return;

    try {
      await postsAPI.delete(post._id);
      showToast("Post deleted successfully.", "success");
      router.push("/my-posts");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to delete post.",
        "error",
      );
    }
  };

  const ownsPost = Boolean(
    user && (user.id === post?.userId || user._id === post?.userId),
  );
  const heroImage = useMemo(() => {
    if (!post?.imageUrl) return null;
    return post.imageUrl.startsWith("http://") ||
      post.imageUrl.startsWith("https://")
      ? post.imageUrl
      : null;
  }, [post?.imageUrl]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08111c] px-5 py-16">
        <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-3xl bg-white/5" />
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#08111c] px-5 text-center text-white">
        <div>
          <h1 className="text-4xl font-black">Post not found</h1>
          <Link
            href="/features"
            className="mt-6 inline-block rounded-xl bg-[#5067f5] px-5 py-3 font-bold"
          >
            Back to Explore
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08111c] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/my-posts" className="text-[#9ba8ff]">
          ← Back
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-10">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1423]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={post.title}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#7184ff,transparent_35%),linear-gradient(135deg,#111b35,#0b1423)]">
                  <span className="text-sm uppercase tracking-[0.25em] text-slate-400">
                    No image provided
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-[#5067f5]/20 px-3 py-1 text-[#b5bdff]">
                {post.platform}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {post.tone}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {post.length}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black italic">{post.title}</h1>

            <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">Overview</h2>
              <p className="mt-3 font-serif text-lg text-slate-400">
                {post.shortDescription}
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">Specifications</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#0b1423]/70 p-4">
                  <p className="text-sm text-slate-500">Platform</p>
                  <p className="mt-1 font-semibold">{post.platform}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0b1423]/70 p-4">
                  <p className="text-sm text-slate-500">Tone</p>
                  <p className="mt-1 font-semibold">{post.tone}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0b1423]/70 p-4">
                  <p className="text-sm text-slate-500">Length</p>
                  <p className="mt-1 font-semibold">{post.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0b1423]/70 p-4">
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="mt-1 font-semibold">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">Generated content</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#0b1423]/70 p-4">
                  <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-200">
                    {post.generatedContent}
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  <p>
                    Need a fresh version? Create another post in the generator
                    and it will stay connected to your library.
                  </p>
                  <Link
                    href="/generate-post"
                    className="mt-3 inline-flex rounded-xl bg-[#5067f5] px-4 py-2 font-semibold text-white"
                  >
                    Create another post
                  </Link>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-bold">Related content</h2>
              <div className="mt-4 space-y-4">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((related) => (
                    <Link
                      key={related._id}
                      href={`/my-posts/${related._id}`}
                      className="block rounded-2xl border border-white/10 bg-[#0b1423]/70 p-4 transition hover:border-[#5067f5]/50"
                    >
                      <p className="font-semibold text-white">
                        {related.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {related.platform} · {related.tone} · {related.length}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                    No other posts found with the same platform and tone.
                  </div>
                )}
              </div>
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard
                    .writeText(post.generatedContent)
                    .then(() => showToast("Post copied.", "success"))
                }
                className="rounded-xl bg-[#5067f5] px-5 py-3 font-bold"
              >
                Copy Post
              </button>
              {ownsPost ? (
                <button
                  type="button"
                  onClick={deletePost}
                  className="rounded-xl border border-red-400/30 px-5 py-3 font-bold text-red-300"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </article>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/3 p-6 text-slate-300">
            <h2 className="font-bold text-white">Post details</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm text-slate-500">Platform</dt>
                <dd>{post.platform}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Tone</dt>
                <dd>{post.tone}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Length</dt>
                <dd>{post.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Status</dt>
                <dd>{post.status || "Published"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </main>
  );
}
