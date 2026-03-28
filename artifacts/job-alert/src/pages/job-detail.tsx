import { useRoute, Link } from "wouter";
import { format, differenceInDays } from "date-fns";
import { 
  Building2, MapPin, BadgeCheck, IndianRupee, Users, 
  Calendar, FileText, ArrowUpRight, ShieldAlert,
  GraduationCap, AlertCircle, CalendarDays, ExternalLink, Bookmark
} from "lucide-react";
import { useGetJobById } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { LoadingSpinner } from "@/components/ui/loading";
import { cn, getCategoryColor } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { AdUnit, AD_SLOTS } from "@/components/ad-unit";

export default function JobDetailPage() {
  const [, params] = useRoute("/jobs/:id");
  const jobId = Number(params?.id);
  
  const { data: job, isLoading, error } = useGetJobById(jobId, { query: { enabled: !!jobId } });
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (isLoading) return <Layout><LoadingSpinner /></Layout>;
  
  if (error || !job) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <ShieldAlert className="w-16 h-16 text-destructive mb-4 opacity-80" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Job Not Found</h1>
          <p className="text-muted-foreground mb-8">This job listing might have been removed or doesn't exist.</p>
          <Link href="/jobs" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
            Browse All Jobs
          </Link>
        </div>
      </Layout>
    );
  }

  const bookmarked = isBookmarked(job.id);
  const categoryColor = getCategoryColor(job.category);
  
  const lastDate = job.lastDate ? new Date(job.lastDate) : null;
  const diffDays = lastDate ? differenceInDays(lastDate, new Date()) : 999;
  const isClosed = diffDays < 0;

  const isPortalFallback = job.description?.startsWith("[PORTAL_FALLBACK]");
  const cleanDescription = isPortalFallback 
    ? job.description?.replace("[PORTAL_FALLBACK]", "").trim() 
    : job.description;

  // Strip out aggregator / third-party URLs — only keep genuine official gov links
  const AGGREGATORS = ["freejobalert.com", "sarkariresult.com", "rojgarresult.com", "sarkarijob.com"];
  function isOfficialUrl(url: string | null | undefined): url is string {
    if (!url) return false;
    try {
      const host = new URL(url).hostname.toLowerCase();
      return !AGGREGATORS.some((a) => host.includes(a));
    } catch {
      return false;
    }
  }
  function isPdfUrl(url: string | null | undefined): url is string {
    return isOfficialUrl(url) && (url?.toLowerCase().endsWith(".pdf") ?? false);
  }

  const officialApplyUrl = isOfficialUrl(job.applyUrl) ? job.applyUrl : null;
  const officialPdfUrl   = isPdfUrl(job.notificationPdfUrl) ? job.notificationPdfUrl : null;

  return (
    <Layout>
      {/* Hero Banner — always dark navy so design stays consistent */}
      <div className="bg-[#0A1628] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={cn("px-4 py-1.5 rounded-full text-sm font-semibold border", categoryColor)}>
                  {job.category}
                </span>
                {job.isVerified && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <BadgeCheck className="w-4 h-4" />
                    Verified Listing
                  </span>
                )}
                {isClosed && (
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    Applications Closed
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4 leading-tight">
                {job.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/60 text-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-white/90">{job.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{job.states.length > 0 ? job.states.join(", ") : "All India"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Posted: {format(new Date(job.createdAt), "dd MMM yyyy")}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons — always show both */}
            <div className="flex flex-col gap-3 shrink-0 w-full lg:w-64">
              {/* Apply Now — official gov link only */}
              {officialApplyUrl && !isClosed ? (
                <a
                  href={officialApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-orange-600 text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {isPortalFallback ? "Visit Official Portal" : "Apply Now"}
                  <ArrowUpRight className="w-5 h-5" />
                </a>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                  >
                    {isClosed ? "Applications Closed" : "Apply Now"}
                  </button>
                  {!isClosed && (
                    <p className="text-center text-xs text-white/40 leading-snug">
                      Direct link not available — check the official website
                    </p>
                  )}
                </div>
              )}

              {/* Save / Bookmark — always visible */}
              <button
                onClick={() => toggleBookmark(job)}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold border transition-all duration-200",
                  bookmarked
                    ? "bg-primary/15 border-primary text-primary"
                    : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40"
                )}
              >
                <Bookmark className={cn("w-5 h-5", bookmarked && "fill-current")} />
                {bookmarked ? "Saved" : "Save Job"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            {/* Billboard Ad — top of main content */}
            <AdUnit slot={AD_SLOTS.large} size="large" format="rectangle" />

            {/* Description */}
            {cleanDescription && (
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" /> About the Job
                </h2>
                <div className="glass-panel p-6 sm:p-8 rounded-2xl">
                  <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {cleanDescription}
                  </div>
                </div>
                {/* In-content ad — after description text, great click intent area */}
                <AdUnit slot={AD_SLOTS.native} size="inline" format="auto" className="mt-4" />
              </section>
            )}

            {/* Eligibility & Qualifications */}
            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-primary" /> Eligibility Criteria
              </h2>
              <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
                {job.qualification && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Educational Qualification</h3>
                    <p className="text-muted-foreground">{job.qualification}</p>
                  </div>
                )}
                
                {(job.ageMin !== null || job.ageMax !== null) && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Age Limit</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {job.ageMin !== null && (
                        <div className="bg-muted/40 p-4 rounded-xl border border-border">
                          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Minimum Age</p>
                          <p className="text-xl font-bold text-foreground">{job.ageMin} Years</p>
                        </div>
                      )}
                      {job.ageMax !== null && (
                        <div className="bg-muted/40 p-4 rounded-xl border border-border">
                          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Maximum Age</p>
                          <p className="text-xl font-bold text-foreground">{job.ageMax} Years</p>
                        </div>
                      )}
                    </div>
                    {job.ageRelaxation && (
                      <p className="mt-4 text-sm text-primary flex items-start gap-2 bg-primary/10 p-3 rounded-lg border border-primary/20">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span><strong>Age Relaxation:</strong> {job.ageRelaxation}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Leaderboard Ad — between eligibility and documents */}
            <AdUnit slot={AD_SLOTS.banner} size="leaderboard" format="horizontal" />

            {/* Documents Required */}
            {(job.photoRequirements || job.signatureRequirements) && (
              <section>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" /> Document Requirements
                </h2>
                <div className="glass-panel p-6 sm:p-8 rounded-2xl grid md:grid-cols-2 gap-6">
                  {job.photoRequirements && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Photograph</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{job.photoRequirements}</p>
                    </div>
                  )}
                  {job.signatureRequirements && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Signature</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{job.signatureRequirements}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Bottom in-content ad — after document requirements */}
            <AdUnit slot={AD_SLOTS.rectangle} size="rectangle" format="rectangle" />

          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 shrink-0 space-y-6">
            {/* Quick Facts */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-6 bg-muted/40 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">Quick Facts</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Vacancies</p>
                    <p className="text-lg font-bold text-foreground">{job.vacancies ?? "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salary / Pay Scale</p>
                    <p className="text-lg font-bold text-foreground">{job.salaryRange || "As per rules"}</p>
                  </div>
                </div>

                {/* Official Website — only show if it's a genuine official URL */}
                {officialApplyUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Official Website</p>
                      <a 
                        href={officialApplyUrl}
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-base font-semibold text-primary hover:underline break-all"
                      >
                        {(() => {
                          try { return new URL(officialApplyUrl).hostname.replace(/^www\./, ""); }
                          catch { return "Official Portal"; }
                        })()}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Official Website</p>
                      <p className="text-sm text-muted-foreground italic">Not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Important Dates */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-6 bg-muted/40 border-b border-border">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" /> Important Dates
                </h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-semibold text-foreground text-right">
                    {job.applicationStartDate ? format(new Date(job.applicationStartDate), "dd MMM yyyy") : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <span className="text-muted-foreground">Last Date</span>
                  <span className={cn("font-bold text-right", isClosed ? "text-red-500" : "text-primary")}>
                    {lastDate ? format(lastDate, "dd MMM yyyy") : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Exam Date</span>
                  <span className="font-semibold text-foreground text-right">
                    {job.examDate ? format(new Date(job.examDate), "dd MMM yyyy") : "To be notified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Rectangle Ad — after Important Dates */}
            <AdUnit slot={AD_SLOTS.rectangle} size="rectangle" format="rectangle" />

            {/* Notification PDF — only show if it's a genuine PDF from official source */}
            {officialPdfUrl ? (
              <a 
                href={officialPdfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="group flex items-center justify-between p-6 glass-panel rounded-2xl hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Official Notification</h3>
                    <p className="text-sm text-muted-foreground">Download PDF</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ) : officialApplyUrl ? (
              /* No PDF but have apply URL — show a "Visit official website" pill */
              <div className="p-5 glass-panel rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Official Notification</p>
                  <a
                    href={officialApplyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline truncate block"
                  >
                    {(() => { try { return new URL(officialApplyUrl).hostname.replace(/^www\./, ""); } catch { return "Official Website"; } })()}
                  </a>
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </Layout>
  );
}
