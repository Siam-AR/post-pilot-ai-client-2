"use client";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { aiAPI, GeneratePostInput, postsAPI } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { buildLoginRedirectUrl } from "@/lib/auth-redirect";

const initial: GeneratePostInput = {
  topic: "",
  platform: "LinkedIn",
  tone: "Professional",
  length: "Medium",
};
export default function GeneratePostPage() {
  const [form, setForm] = useState(initial);
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(buildLoginRedirectUrl(pathname));
    }
  }, [authLoading, isAuthenticated, pathname, router]);

  const set = <K extends keyof GeneratePostInput>(
    key: K,
    value: GeneratePostInput[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  const generate = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.topic.trim())
      return showToast("Please add a topic first.", "warning");
    setLoading(true);
    try {
      const response = await aiAPI.generate(form);
      setContent(response.generatedContent);
      setSaved(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Generation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!content || saving || saved) return;
    if (!isAuthenticated) {
      showToast("Please log in to save this post.", "warning");
      router.replace(buildLoginRedirectUrl(pathname));
      return;
    }

    setSaving(true);
    try {
      await postsAPI.create({
        title: form.topic.slice(0, 120),
        shortDescription: content.slice(0, 100),
        generatedContent: content,
        platform: form.platform,
        tone: form.tone,
        length: form.length,
        imageUrl,
      });
      setSaved(true);
      showToast("Post saved successfully.", "success");
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Unable to save post.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08111c] px-5 py-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <form
          onSubmit={generate}
          className="rounded-3xl border border-white/10 bg-white/3 p-7"
        >
          <h1 className="text-3xl font-black">Generate post</h1>
          <textarea
            value={form.topic}
            onChange={(e) => set("topic", e.target.value)}
            placeholder="Topic"
            className="mt-6 min-h-36 w-full rounded-xl bg-[#0b1423] p-4"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Optional image URL"
            type="url"
            className="mt-4 w-full rounded-xl bg-[#0b1423] p-4"
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(
              [
                [
                  "platform",
                  ["LinkedIn", "Facebook", "Instagram", "X (Twitter)"],
                ],
                [
                  "tone",
                  ["Professional", "Casual", "Friendly", "Persuasive", "Funny"],
                ],
                ["length", ["Short", "Medium", "Long"]],
              ] as const
            ).map(([key, values]) => (
              <select
                key={key}
                value={form[key]}
                onChange={(e) => set(key, e.target.value as never)}
                className="rounded-xl bg-[#0b1423] p-3"
              >
                {values.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ))}
          </div>
          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#5067f5] py-4 font-bold"
          >
            {loading ? "Generating..." : "Generate post"}
          </button>
        </form>

        <section className="rounded-3xl border border-white/10 bg-white/3 p-7">
          {content ? (
            <>
              <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                {content}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(content)
                      .then(() => showToast("Post copied.", "success"))
                  }
                  className="rounded-xl border border-white/10 px-4 py-3"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || saved}
                  className="rounded-xl bg-[#5067f5] px-4 py-3 font-bold disabled:opacity-60"
                >
                  {saving ? "Saving..." : saved ? "Saved" : "Save Post"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-slate-400">
              Your generated post will appear here.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
