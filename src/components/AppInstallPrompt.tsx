import * as React from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check dismissal cooldown (7 days)
    const dismissedAt = localStorage.getItem('funkyfox_pwa_dismissed_at');
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        // Still in cooldown, but keep listeners ready for manual trigger
      }
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    if (isIosDevice && isSafari && !isStandalone) {
      setIsIOS(true);
      // Show prompt after 4 seconds on iOS if not dismissed
      const timer = setTimeout(() => {
        if (!dismissedAt) setIsVisible(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    // 4. Capture native beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 3.5 seconds
      setTimeout(() => {
        const currentDismissed = localStorage.getItem('funkyfox_pwa_dismissed_at');
        if (!currentDismissed) {
          setIsVisible(true);
        }
      }, 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Listen for custom manual trigger (e.g. from mobile drawer button)
    const handleManualTrigger = () => {
      setIsVisible(true);
    };
    window.addEventListener('funkyfox:open_app_install', handleManualTrigger);

    // 6. Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('funkyfox:open_app_install', handleManualTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback instruction
      alert('To add Funky Fox to your home screen, tap the browser menu (⋮) and select "Add to Home Screen".');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSInstructions(false);
    localStorage.setItem('funkyfox_pwa_dismissed_at', Date.now().toString());
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <>
      {/* ================= FLOATING APP INSTALL BANNER ================= */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slideUp">
        <div className="bg-[#141414] text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 flex items-center gap-3.5 backdrop-blur-md">
          {/* Fox App Icon */}
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#E87535] to-[#D05C1C] flex items-center justify-center shrink-0 shadow-inner">
            <svg viewBox="0 0 36 28" className="h-6 w-auto" aria-hidden="true" fill="none">
              <path
                d="M3 5 L12 24 L18 16 L24 24 L33 5 L24 9 L18 3 L12 9 Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="11" r="1.5" fill="#141414" />
              <circle cx="22" cy="11" r="1.5" fill="#141414" />
              <path d="M16 16 L18 18 L20 16 Z" fill="#141414" />
            </svg>
          </div>

          {/* Text Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">Install Funky Fox App</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E87535] text-white uppercase tracking-wider">Fast</span>
            </div>
            <p className="text-[11px] text-white/70 truncate mt-0.5">
              Add shortcut to home screen for an app experience
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E87535] hover:bg-[#D05C1C] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss app download prompt"
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= IOS SAFARI STEP-BY-STEP MODAL ================= */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-[#0D1220] rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={20} className="text-[#E87535]" />
                <h3 className="text-base font-bold text-[#0D1220]">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSInstructions(false)}
                className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-[#5B6478]">
              Follow these simple 2 steps in Safari to add Funky Fox directly to your iPhone home screen:
            </p>

            <div className="space-y-3 bg-[#FAF9F6] p-4 rounded-2xl border border-[#EBE7DC] text-xs">
              <div className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full bg-[#E87535] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[#0D1220] leading-relaxed">
                  Tap the <strong className="inline-flex items-center gap-1 font-bold text-[#E87535]"><Share size={13} /> Share</strong> icon at the bottom of your Safari screen.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="h-5 w-5 rounded-full bg-[#E87535] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[#0D1220] leading-relaxed">
                  Scroll down the menu and tap <strong className="inline-flex items-center gap-1 font-bold text-[#0D1220]"><PlusSquare size={13} /> Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-[#141414] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
