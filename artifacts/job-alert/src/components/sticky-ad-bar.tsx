import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const CUSTOM_PUB_ID = import.meta.env.VITE_ADSENSE_PUB_ID ?? "";
const TEST_PUB_ID = "ca-pub-3940256099942544";
const PUB_ID = CUSTOM_PUB_ID || TEST_PUB_ID;
const IS_TEST = !CUSTOM_PUB_ID;

export function StickyAdBar() {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pushed.current && insRef.current && visible && !dismissed) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {/* blocked */}
    }
  }, [visible, dismissed]);

  // Dismiss for 60s then reappear
  const handleDismiss = () => {
    setDismissed(true);
    dismissTimerRef.current = setTimeout(() => {
      setDismissed(false);
    }, 60 * 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500",
        visible && !dismissed ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="relative bg-card border-t border-border shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute -top-8 right-2 p-1.5 rounded-t-lg bg-card border border-b-0 border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close ad"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <span className="text-[9px] uppercase tracking-widest font-semibold text-muted-foreground/50 shrink-0">
            Ad
          </span>

          <div className="flex-1 overflow-hidden relative min-h-[60px]">
            {/* Visible fallback behind the ins */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-lg bg-muted/50 border border-dashed border-border pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-bold">Ad</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">Sponsored — Sticky Bottom Banner</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">728 × 60 · Google AdSense Test Unit</p>
              </div>
            </div>

            <ins
              ref={insRef}
              className="adsbygoogle relative z-10"
              style={{ display: "block", width: "100%", height: 60 }}
              data-ad-client={PUB_ID}
              data-ad-slot="6300978111"
              data-ad-format="horizontal"
              data-full-width-responsive="true"
              {...(IS_TEST ? { "data-adtest": "on" } : {})}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
