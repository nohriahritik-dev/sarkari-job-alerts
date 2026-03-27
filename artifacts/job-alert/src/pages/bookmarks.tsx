import { BookmarkIcon } from "lucide-react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { AdUnit } from "@/components/ad-unit";

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 lg:pt-32 lg:pb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <BookmarkIcon className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Saved Jobs</h1>
            <p className="text-muted-foreground mt-1">Jobs you've bookmarked for later ({bookmarks.length})</p>
          </div>
        </div>

        {/* Top banner ad */}
        <AdUnit slot="6300978111" size="leaderboard" format="horizontal" className="mb-8" />

        {bookmarks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookmarks.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            {bookmarks.length > 4 && (
              <>
                <AdUnit slot="6300978111" size="leaderboard" format="horizontal" className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {bookmarks.slice(4).map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center text-center mt-8 min-h-[40vh]">
            <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center mb-6">
              <BookmarkIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No saved jobs yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Keep track of jobs you're interested in by clicking the star icon on any job listing.
            </p>
            <Link 
              href="/jobs" 
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-colors shadow-lg shadow-primary/20"
            >
              Explore Jobs
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
