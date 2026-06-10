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
    return <BoardDisplay displayCode={displayCode} variant="tv" />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0919] p-8 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-indigo-900/30 blur-[120px]" />
        <div className="absolute -right-64 top-0 h-[500px] w-[500px] rounded-full bg-rose-900/25 blur-[120px]" />
      </div>
      <div className="relative max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur">
        <p className="text-sm font-black uppercase tracking-[0.45em] text-cyan-200/80">
          Chromecast receiver
        </p>
        <h1 className="mt-5 text-5xl font-black">Waiting for a mission code.</h1>
        <p className="mt-5 text-white/50">
          {ready
            ? "Cast a CodeWords game from the controller to show the live board here."
            : "Loading the Cast receiver framework..."}
        </p>
      </div>
    </main>
  );
}
