"use client";

import { useEffect, useState } from "react";

import { BoardDisplay } from "../board/[displayCode]/BoardDisplay";

const namespace =
  process.env.NEXT_PUBLIC_CAST_CHANNEL_NAMESPACE ??
  "urn:x-cast:ch.cimnine.chromecast-cryptowords.text";

function parseCastMessage(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function isJoinGameMessage(value: unknown): value is { type: "joinGame"; displayCode: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "displayCode" in value &&
    value.type === "joinGame" &&
    typeof value.displayCode === "string"
  );
}

export default function ReceiverPage() {
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const connectCastReceiver = () => {
      const framework = window.cast?.framework;
      if (!framework) {
        timeoutId = setTimeout(connectCastReceiver, 25);
        return;
      }

      const context = framework.CastReceiverContext.getInstance();
      const options = new framework.CastReceiverOptions();
      options.disableIdleTimeout = true;

      context.addCustomMessageListener(namespace, (event) => {
        const message = parseCastMessage(event.data);
        if (isJoinGameMessage(message)) {
          setDisplayCode(message.displayCode);
        }
      });
      context.start(options);
      setReady(true);
    };

    connectCastReceiver();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (displayCode) {
    return <BoardDisplay displayCode={displayCode} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#293b7a,transparent_35%),#100d1f] p-8 text-white">
      <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur">
        <p className="text-sm font-black uppercase tracking-[0.45em] text-cyan-200">
          Chromecast receiver
        </p>
        <h1 className="mt-5 text-5xl font-black">Waiting for a mission code.</h1>
        <p className="mt-5 text-white/70">
          {ready
            ? "Cast a CodeWords game to this screen to join its Convex-backed board."
            : "Loading the Cast receiver framework..."}
        </p>
      </div>
    </main>
  );
}
