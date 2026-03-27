import { Link } from "wouter";
import { format, differenceInDays } from "date-fns";
import { Building2, Calendar, MapPin, BadgeCheck, Star, IndianRupee, Users } from "lucide-react";
import type { Job } from "@workspace/api-client-react";
import { cn, getCategoryColor, getCategoryName } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";

export function JobCard({ job, className }: { job: Job; className?: string }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(job.id);

  // Date Logic
  const lastDateStr = job.lastDate;
  let diffDays = 999;
  let dateColor = "text-green-400 bg-green-500/10 border-green-500/20";
  let formattedDate = "Not specified";

  if (lastDateStr) {
    const lastDate = new Date(lastDateStr);
    formattedDate = format(lastDate, "dd MMM yyyy");
    diffDays = differenceInDays(lastDate, new Date());
    
    if (diffDays < 0) {
      dateColor = "text-muted-foreground bg-muted border-border";
      formattedDate = `Closed (${formattedDate})`;
    } else if (diffDays <= 3) {
      dateColor = "text-red-400 bg-red-500/10 border-red-500/20";
    } else if (diffDays <= 7) {
      dateColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
    }
  }

  const categoryColor = getCategoryColor(job.category);

  return (
    <div className={cn("group flex flex-col glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/10 hover:border-primary/30", className)}>
      <div className="p-6 flex-1 flex flex-col">
        {/* Header Strip */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", categoryColor)}>
              {getCategoryName(job.category)}
            </span>
            {job.isVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleBookmark(job);
            }}
            className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Star className={cn("w-5 h-5", bookmarked && "fill-primary text-primary")} />
          </button>
        </div>

        {/* Title & Dept */}
        <Link href={`/jobs/${job.id}`} className="block group/link mb-4 focus:outline-none">
          <h3 className="text-xl font-bold text-foreground group-hover/link:text-primary transition-colors line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{job.department}</span>
          </div>
        </Link>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{job.states.length > 0 ? job.states.join(", ") : "All India"}</span>
          </div>
          {job.vacancies ? (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <span>{job.vacancies} posts</span>
            </div>
          ) : (
             <div />
          )}
          {job.salaryRange && (
            <div className="flex items-center gap-2 col-span-2">
              <IndianRupee className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{job.salaryRange}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Strip */}
      <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className={cn("w-4 h-4", dateColor.split(' ')[0])} />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold leading-none">Last Date</span>
            <span className={cn("text-sm font-semibold mt-0.5", dateColor.split(' ')[0])}>
              {diffDays > 0 && diffDays <= 7 ? `In ${diffDays} Days` : formattedDate}
            </span>
          </div>
        </div>
        <Link 
          href={`/jobs/${job.id}`} 
          className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors border border-primary/20 hover:border-primary"
        >
          Details →
        </Link>
      </div>
    </div>
  );
}
