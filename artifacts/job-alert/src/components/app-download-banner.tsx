import { useEffect, useState, useRef } from "react";
import { X, Bell, Download, Smartphone, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

const STORAGE_KEY = "sarkari_app_banner_v2";

// Sticky ad bar is ~80px tall (60px ad + ~20px padding/border). We sit just above it.
const ABOVE_STICKY_AD = 88;

export function AppDownloadBanner() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const shownRef = useRef(false); // prevent double-show

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Don't show if permanently dismissed by user
    if (stored === "dismissed_forever") return;

    // --- Trigger 1: On home page after 1.5s (first-visit banner) ---
    let homeTimer: ReturnType<typeof setTimeout> | null = null;
    if (location === "/" && !shownRef.current) {
      homeTimer = setTimeout(() => {
        if (!shownRef.current) {
          shownRef.current = true;
          setAnimateOut(false);
          setVisible(true);
        }
      }, 1500);
    }

    // --- Trigger 2: After 2 minutes on ANY page, show again ---
    const twoMinTimer = setTimeout(() => {
      if (!shownRef.current) {
        shownRef.current = true;
        setAnimateOut(false);
        setVisible(true);
      }
    }, 2 * 60 * 1000);

    return () => {
      if (homeTimer) clearTimeout(homeTimer);
      clearTimeout(twoMinTimer);
    };
    // Only run once on mount — triggers are time-based, not route-based
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = (permanent = false) => {
    setAnimateOut(true);
    setTimeout(() => {
      setVisible(false);
      shownRef.current = false; // allow the 2-min trigger later if not permanent
      if (permanent) {
        localStorage.setItem(STORAGE_KEY, "dismissed_forever");
      }
    }, 350);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: ABOVE_STICKY_AD,
        left: 0,
        right: 0,
        zIndex: 9999, // above sticky ad (z-50 = 50)
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
        pointerEvents: "none",
        animation: animateOut
          ? "appBannerOut 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards"
          : "appBannerIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }}
    >
      <style>{`
        @keyframes appBannerIn {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes appBannerOut {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(30px); opacity: 0; }
        }
        .app-dl-btn { transition: opacity 0.2s, transform 0.2s; }
        .app-dl-btn:hover { opacity: 0.9; transform: scale(1.04); }
        .app-dismiss-btn { transition: background 0.15s, opacity 0.15s; }
        .app-dismiss-btn:hover { background: rgba(255,255,255,0.15) !important; }
      `}</style>

      <div
        style={{
          pointerEvents: "all",
          maxWidth: "480px",
          width: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%)",
          borderRadius: "18px",
          border: "1px solid rgba(255, 145, 0, 0.35)",
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,140,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #ff6b00, #ffaa00, #ff6b00)",
          }}
        />

        {/* Dismiss (×) */}
        <button
          onClick={() => dismiss(false)}
          className="app-dismiss-btn"
          title="Close"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: "50%",
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
            padding: 0,
          }}
          aria-label="Dismiss"
        >
          <X style={{ width: "13px", height: "13px" }} />
        </button>

        {/* Main content row */}
        <div style={{ padding: "18px 20px 14px 20px", display: "flex", gap: "14px", alignItems: "center" }}>
          {/* Bell icon */}
          <div
            style={{
              flexShrink: 0,
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #ff6b00, #ffaa00)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(255, 107, 0, 0.45)",
            }}
          >
            <Bell style={{ width: "24px", height: "24px", color: "white" }} />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#ff9d00",
                textTransform: "uppercase",
                marginBottom: "3px",
              }}
            >
              🔔 Fastest Notifications
            </span>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "white", lineHeight: "1.3", marginBottom: "3px" }}>
              Never Miss a Sarkari Job!
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: "1.4" }}>
              Get instant alerts · Be first to apply
            </p>
          </div>

          {/* Download CTA */}
          <a
            href="https://play.google.com/store/apps/details?id=com.sarkarialert"
            target="_blank"
            rel="noopener noreferrer"
            className="app-dl-btn"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "linear-gradient(135deg, #ff6b00, #ffaa00)",
              color: "white",
              padding: "9px 14px",
              borderRadius: "11px",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(255, 107, 0, 0.4)",
              whiteSpace: "nowrap",
            }}
          >
            <Download style={{ width: "13px", height: "13px" }} />
            Download
            <ChevronRight style={{ width: "11px", height: "11px" }} />
          </a>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Smartphone style={{ width: "11px", height: "11px", color: "rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
              Android · Free · No spam
            </span>
          </div>
          <button
            onClick={() => dismiss(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "10px",
              color: "rgba(255,255,255,0.25)",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
}
