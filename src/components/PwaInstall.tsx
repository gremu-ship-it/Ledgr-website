"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstall({
  className = "",
  label = "Install web app",
}: {
  className?: string;
  label?: string;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Register the service worker so the site is installable & offline-capable.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleClick() {
    if (!deferred) {
      setShowHelp((s) => !s);
      return;
    }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <span className="inline-flex flex-col items-stretch">
      <button
        type="button"
        onClick={handleClick}
        className={className}
        aria-label={label}
        aria-expanded={showHelp}
      >
        <span className="text-xl" aria-hidden>
          📲
        </span>
        {installed ? "Installed ✓" : label}
      </button>
      {showHelp && !installed && (
        <span className="mt-2 max-w-xs rounded-xl border border-slate-200 bg-white p-4 text-left text-xs leading-relaxed text-ink shadow-xl">
          <strong>Install Ledgr:</strong>
          <br />
          Android — browser menu → “Add to Home screen”.
          <br />
          Windows / Mac — Chrome or Edge → install icon in the address bar.
        </span>
      )}
    </span>
  );
}
