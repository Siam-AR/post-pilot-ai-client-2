import { Suspense } from "react";
import MyPostsClient from "./MyPostsClient";

export default function MyPostsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08111c] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-10 w-48 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    }>
      <MyPostsClient />
    </Suspense>
  );
}
