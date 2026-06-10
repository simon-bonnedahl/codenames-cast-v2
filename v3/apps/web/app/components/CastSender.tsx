"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

const senderSdkUrl =
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
const receiverApplicationId = process.env.NEXT_PUBLIC_CAST_APP_ID ?? "D4507123";
const namespace =
  process.env.NEXT_PUBLIC_CAST_CHANNEL_NAMESPACE ??
  "urn:x-cast:ch.cimnine.chromecast-cryptowords.text";

type CastSenderProps = {
  displayCode: string | null;
};

type CastSession = {
  sendMessage: (namespace: string, message: unknown) => Promise<void>;
};

function getCastContext() {
  const framework = window.cast?.framework;
  const chromeCast = window.chrome?.cast;
  if (!framework || !chromeCast) return null;
  const context = framework.CastContext.getInstance();
  context.setOptions({
    receiverApplicationId,
    autoJoinPolicy: chromeCast.AutoJoinPolicy.ORIGIN_SCOPED,
  });
  return context;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendJoinGameMessage(session: CastSession, displayCode: string) {
  await session.sendMessage(namespace, { type: "joinGame", displayCode });
}

export function CastSender({ displayCode }: CastSenderProps) {
  const launcherMountRef = useRef<HTMLSpanElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [casting, setCasting] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const initializeCast = useCallback(() => {
    const context = getCastContext();
    if (!context) return;
    setIsReady(true);
  }, []);

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) initializeCast();
    };
    initializeCast();
  }, [initializeCast]);

  useEffect(() => {
    const mount = launcherMountRef.current;
    if (!mount || mount.childElementCount > 0) return;
    const launcher = document.createElement("google-cast-launcher");
    launcher.className = "block h-7 w-7 text-white/60";
    mount.appendChild(launcher);
    return () => { launcher.remove(); };
  }, []);

  async function sendRoomToCast() {
    if (!displayCode) return;
    const context = getCastContext();
    if (!context) {
      setTooltip("Cast not available in this browser");
      setTimeout(() => setTooltip(null), 3000);
      return;
    }

    setCasting(true);
    try {
      if (!context.getCurrentSession()) {
        await context.requestSession();
      }
      const session = context.getCurrentSession();
      if (!session) throw new Error("No session");

      await sendJoinGameMessage(session, displayCode);
      await wait(1000);
      await sendJoinGameMessage(session, displayCode);
      await wait(2500);
      await sendJoinGameMessage(session, displayCode);

      setTooltip(`Sent to TV`);
      setTimeout(() => setTooltip(null), 3000);
    } catch {
      setTooltip("Could not cast");
      setTimeout(() => setTooltip(null), 3000);
    } finally {
      setCasting(false);
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      <Script src={senderSdkUrl} strategy="afterInteractive" onLoad={initializeCast} />

      {/* Native Cast launcher button (device picker) */}
      <span
        ref={launcherMountRef}
        className="flex h-8 w-8 items-center justify-center opacity-70 hover:opacity-100"
        title="Select Cast device"
      />

      {/* Send to TV button */}
      <button
        className={[
          "rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition",
          isReady && displayCode
            ? "border border-purple-400/30 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 hover:text-white"
            : "cursor-not-allowed border border-white/5 bg-white/3 text-white/25",
        ].join(" ")}
        disabled={!displayCode || !isReady || casting}
        type="button"
        onClick={sendRoomToCast}
      >
        {casting ? "Sending…" : "Cast to TV"}
      </button>

      {tooltip && (
        <span className="absolute -top-8 right-0 whitespace-nowrap rounded-lg bg-black/80 px-2 py-1 text-xs text-white/80">
          {tooltip}
        </span>
      )}
    </div>
  );
}
