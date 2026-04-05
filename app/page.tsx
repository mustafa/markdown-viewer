"use client";

import dynamic from "next/dynamic";

const MainLayout = dynamic(() => import("@/components/layout/MainLayout"), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
      <div className="text-neutral-400 dark:text-neutral-500 text-sm">
        Loading editor...
      </div>
    </div>
  ),
});

export default function Page() {
  return <MainLayout />;
}
