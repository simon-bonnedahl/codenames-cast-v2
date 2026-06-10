"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function Providers({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <main className="min-h-screen bg-[#100d1f] px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-200">
            CodeWords setup
          </p>
          <h1 className="mt-4 text-4xl font-black">Convex is not connected yet.</h1>
          <p className="mt-4 text-white/75">
            Add <code>NEXT_PUBLIC_CONVEX_URL</code> for this web app, then run the
            Convex dev server from <code>packages/backend</code>.
          </p>
        </div>
      </main>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
