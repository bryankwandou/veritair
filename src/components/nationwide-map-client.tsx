"use client";

import dynamic from "next/dynamic";

export const NationwideMap = dynamic(
  () => import("@/components/nationwide-map").then((m) => m.NationwideMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        Loading the national map…
      </div>
    ),
  }
);
