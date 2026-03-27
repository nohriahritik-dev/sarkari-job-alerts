import { useEffect, useRef } from "react";
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

type AdFormat = "auto" | "horizontal" | "rectangle" | "vertical";
type AdSize = "leaderboard" | "rectangle" | "responsive" | "large";

const MIN_HEIGHTS: Record<AdSize, string> = {
  leaderboard: "min-h-[90px]",
  rectangle:   "min-h-[250px]",
  large:       "min-h-[400px]",
  responsive:  "min-h-[90px]",
};

const LABELS: Record<AdSize, string> = {
  leaderboard: "728 × 90",
  rectangle:   "300 × 250",
  large:       "970 × 400",
  responsive:  "Responsive",
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
      <p className="text-center text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mb-1">
        Advertisement
      </p>

      {/* Outer shell: always visible, dashed border placeholder */}
      <div
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed border-border bg-muted/30",
          "flex flex-col items-center justify-center",
          MIN_HEIGHTS[size]
        )}
      >
        {/* Fallback label — sits behind the ins tag */}
        <div className="flex flex-col items-center gap-2 text-muted-foreground pointer-events-none select-none">
          <svg className="w-6 h-6 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <span className="text-xs font-medium opacity-50">Ad — {LABELS[size]}</span>
        </div>

        {/* AdSense ins — positioned absolute so it covers the fallback when filled */}
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
