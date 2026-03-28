import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const CUSTOM_PUB_ID = import.meta.env.VITE_ADSENSE_PUB_ID ?? "";
// Google's official AdSense test Publisher ID — safe to use in test mode
const TEST_PUB_ID = "ca-pub-3940256099942544";
const PUB_ID = CUSTOM_PUB_ID || TEST_PUB_ID;
const IS_TEST = !CUSTOM_PUB_ID;

// Official Google AdSense test ad unit slot IDs
export const AD_SLOTS = {
  banner:       "6300978111",   // Banner 320x50 / 728x90
  rectangle:    "1033173712",   // Medium Rectangle 300x250
  interstitial: "1033173712",   // Interstitial
  native:       "2247696110",   // Native Advanced
  large:        "6300978111",   // Large / Billboard
} as const;

type AdFormat = "auto" | "horizontal" | "rectangle" | "vertical";
type AdSize = "leaderboard" | "rectangle" | "responsive" | "large" | "inline";

const MIN_HEIGHTS: Record<AdSize, string> = {
  leaderboard: "min-h-[90px]",
  rectangle:   "min-h-[250px]",
  large:       "min-h-[280px]",
  responsive:  "min-h-[100px]",
  inline:      "min-h-[130px]",
};

const LABELS: Record<AdSize, string> = {
  leaderboard: "728 × 90 Leaderboard",
  rectangle:   "300 × 250 Rectangle",
  large:       "970 × 280 Billboard",
  responsive:  "Responsive",
  inline:      "In-Content",
};

interface AdUnitProps {
  slot: string;
  format?: AdFormat;
  size?: AdSize;
  className?: string;
}

export function AdUnit({ slot, format = "auto", size = "responsive", className }: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pushed.current && insRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* AdSense blocked or not loaded */
      }
    }
  }, []);

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <p className="text-center text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] mb-1 select-none">
        Advertisement
      </p>

      {/* Outer shell: always visible, subtle placeholder */}
      <div
        className={cn(
          "relative w-full rounded-xl border border-dashed border-border/60 bg-muted/20",
          "flex flex-col items-center justify-center overflow-hidden",
          MIN_HEIGHTS[size]
        )}
      >
        {/* Fallback label — sits behind the ins tag */}
        <div className="flex flex-col items-center gap-1.5 text-muted-foreground/40 pointer-events-none select-none">
          <svg className="w-5 h-5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <span className="text-[10px] font-medium">{LABELS[size]}</span>
        </div>

        {/* AdSense ins element — overlays the fallback when an ad fills */}
        <ins
          ref={insRef}
          className="adsbygoogle absolute inset-0 rounded-xl overflow-hidden"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={PUB_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
          {...(IS_TEST ? { "data-adtest": "on" } : {})}
        />
      </div>
    </div>
  );
}
