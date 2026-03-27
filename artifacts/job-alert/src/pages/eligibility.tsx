import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, UserCheck, BadgeCheck } from "lucide-react";
import { Layout } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { AdUnit } from "@/components/ad-unit";
import { useCheckEligibility, type EligibilityParams } from "@/hooks/use-eligibility";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const QUALIFICATIONS = ["10th", "12th", "Graduate", "Post-Graduate"];

const CATEGORIES = ["General", "EWS", "OBC", "SC", "ST"];

const RELAXATION: Record<string, number> = {
  General: 0,
  EWS: 0,
  OBC: 3,
  SC: 5,
  ST: 5,
};

export default function EligibilityPage() {
  const [age, setAge] = useState("");
  const [qualification, setQualification] = useState("");
  const [category, setCategory] = useState("General");
  const [submitted, setSubmitted] = useState<EligibilityParams | null>(null);
  const [page, setPage] = useState(1);

  const params: EligibilityParams | null = submitted
    ? { ...submitted, page }
    : null;

  const { data, isLoading, isError } = useCheckEligibility(params);

  const ageNum = parseInt(age, 10);
  const canCheck = age !== "" && !isNaN(ageNum) && ageNum >= 15 && ageNum <= 65 && qualification !== "";

  function handleCheck() {
    if (!canCheck) return;
    setPage(1);
    setSubmitted({ age: ageNum, qualification, category });
  }

  function handleReset() {
    setAge("");
    setQualification("");
    setCategory("General");
    setSubmitted(null);
    setPage(1);
  }

  const relaxation = RELAXATION[category] ?? 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 lg:pt-32">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Eligibility Checker</h1>
          </div>
          <p className="text-muted-foreground">
            Enter your details below to find all government jobs you may be eligible for.
          </p>
        </div>

        {/* Form card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6">
          <div className="space-y-8">
            {/* Age */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                Your Age
              </label>
              <input
                type="number"
                min={15}
                max={65}
                placeholder="e.g. 25"
                value={age}
                onChange={(e) => { setAge(e.target.value); setSubmitted(null); }}
                className="w-full max-w-xs bg-background border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg font-semibold transition-colors"
              />
              {age && !isNaN(ageNum) && relaxation > 0 && (
                <p className="mt-2 text-xs text-primary font-medium">
                  {category} category gets +{relaxation} years age relaxation on eligible posts
                </p>
              )}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                Highest Qualification
              </label>
              <div className="flex flex-wrap gap-3">
                {QUALIFICATIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => { setQualification(q); setSubmitted(null); }}
                    className={cn(
                      "px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-200",
                      qualification === q
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "bg-background border-border text-foreground hover:border-primary/60 hover:text-primary"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Reservation Category */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                Reservation Category
              </label>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setSubmitted(null); }}
                    className={cn(
                      "px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-200",
                      category === cat
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "bg-background border-border text-foreground hover:border-primary/60 hover:text-primary"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Check button */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start">
            <button
              onClick={handleCheck}
              disabled={!canCheck || isLoading}
              className={cn(
                "flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200",
                canCheck && !isLoading
                  ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Checking...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Check Eligibility</>
              )}
            </button>
            {submitted && (
              <button
                onClick={handleReset}
                className="px-5 py-3.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium text-sm transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Disclaimer */}
          <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Results are indicative based on available data. Always verify eligibility with the official recruitment notification before applying.
          </p>
        </div>

        {/* Ad between form and results */}
        <AdUnit slot="6300978111" size="leaderboard" format="horizontal" className="mb-6" />

        {/* Results */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-muted-foreground font-medium">Finding matching jobs…</p>
                </div>
              )}

              {isError && (
                <div className="glass-panel rounded-2xl p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                  <p className="text-foreground font-semibold mb-1">Something went wrong</p>
                  <p className="text-muted-foreground text-sm">Please try again with different details.</p>
                </div>
              )}

              {!isLoading && !isError && data && (
                <>
                  {/* Summary banner */}
                  <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-foreground font-semibold">
                      {data.total > 0 ? (
                        <>
                          <span className="text-primary text-lg">{data.total}</span> jobs found for{" "}
                          <span className="text-primary">Age {submitted.age}</span> ·{" "}
                          <span className="text-primary">{submitted.qualification}</span> ·{" "}
                          <span className="text-primary">{submitted.category}</span>
                          {relaxation > 0 && (
                            <span className="text-muted-foreground text-sm font-normal ml-1">
                              (incl. {relaxation}-yr age relaxation)
                            </span>
                          )}
                        </>
                      ) : (
                        "No matching jobs found for your profile"
                      )}
                    </p>
                    {data.total > 0 && (
                      <Link
                        href="/jobs"
                        className="ml-auto text-xs text-primary font-semibold hover:underline"
                      >
                        Browse all jobs →
                      </Link>
                    )}
                  </div>

                  {data.total === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center">
                      <p className="text-foreground font-semibold mb-2">No jobs match your current profile</p>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Try a different qualification level or check back as new jobs are added every few hours.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.jobs.slice(0, 6).map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>

                      {data.jobs.length > 6 && (
                        <>
                          <AdUnit slot="6300978111" size="leaderboard" format="horizontal" className="my-6" />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.jobs.slice(6).map((job) => (
                              <JobCard key={job.id} job={job} />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Pagination */}
                      {(data.totalPages ?? 1) > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-10">
                          <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-5 py-2.5 rounded-xl border border-border glass-panel text-foreground font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors"
                          >
                            ← Prev
                          </button>
                          <span className="text-sm text-muted-foreground font-medium">
                            Page {page} of {data.totalPages}
                          </span>
                          <button
                            disabled={page >= (data.totalPages ?? 1)}
                            onClick={() => setPage((p) => Math.min(data.totalPages ?? p, p + 1))}
                            className="px-5 py-2.5 rounded-xl border border-border glass-panel text-foreground font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
