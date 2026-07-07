"use client";

import dynamic from "next/dynamic";

export const NetworkMap = dynamic(
  () => import("@/components/network-map").then((m) => m.NetworkMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);
