import { useMemo } from "react";
import { Link } from "wouter";
import { Zap } from "lucide-react";

interface Job {
  id: string | number;
  title: string;
  slug?: string;
}

interface NewUpdatesSectionProps {
  jobs: Job[];
}

// Seeded shuffle using current date as seed — changes every page load (refresh)
function shuffleWithSeed<T>(arr: T[]): T[] {
  const seed = Date.now();
  const clone = [...arr];
  let s = seed;
  for (let i = clone.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export function NewUpdatesSection({ jobs }: NewUpdatesSectionProps) {
  // Re-shuffled on every render/refresh — useMemo with no deps so it runs once per mount
  const shuffled = useMemo(() => shuffleWithSeed(jobs).slice(0, 9), [jobs]);

  if (!jobs.length) return null;

  // Split into 3 columns of 3
  const col1 = shuffled.slice(0, 3);
  const col2 = shuffled.slice(3, 6);
  const col3 = shuffled.slice(6, 9);

  const getJobHref = (job: Job) =>
    job.slug ? `/jobs/${job.slug}` : `/jobs/${job.id}`;

  const renderColumn = (items: Job[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {items.map((job, i) => (
        <Link
          key={job.id}
          href={getJobHref(job)}
          style={{
            display: "block",
            padding: "8px 10px",
            fontSize: "13px",
            color: "#1a5fb4",
            textDecoration: "none",
            borderBottom: i < items.length - 1 ? "1px solid #e8e8e8" : "none",
            lineHeight: "1.4",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "#f0f6ff";
            (e.currentTarget as HTMLAnchorElement).style.color = "#0a3d91";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            (e.currentTarget as HTMLAnchorElement).style.color = "#1a5fb4";
          }}
        >
          {job.title}
        </Link>
      ))}
    </div>
  );

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 16px 8px",
      }}
    >
      {/* "New Updates" header — blue gradient like competitor */}
      <div
        style={{
          background: "linear-gradient(90deg, #1a5fb4 0%, #2d7dd2 100%)",
          borderRadius: "8px 8px 0 0",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Zap style={{ width: "16px", height: "16px", color: "#fff", flexShrink: 0 }} />
        <span
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "0.02em",
          }}
        >
          New Updates
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            color: "rgba(255,255,255,0.65)",
            fontStyle: "italic",
          }}
        >
          Latest govt job notifications
        </span>
      </div>

      {/* Grid of 3 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          border: "1px solid #d0d8e8",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          overflow: "hidden",
          background: "white",
        }}
      >
        <div style={{ borderRight: "1px solid #e0e8f0" }}>{renderColumn(col1)}</div>
        <div style={{ borderRight: "1px solid #e0e8f0" }}>{renderColumn(col2)}</div>
        <div>{renderColumn(col3)}</div>
      </div>
    </div>
  );
}
