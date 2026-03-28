import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetJobs, useGetCategories, useGetStates } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { LoadingSpinner } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import { AdUnit, AD_SLOTS } from "@/components/ad-unit";

interface FilterPanelProps {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  stateFilter: string;
  setStateFilter: (v: string) => void;
  qualification: string;
  setQualification: (v: string) => void;
  setPage: (v: number) => void;
  setIsMobileFiltersOpen: (v: boolean) => void;
  categories: { slug: string; name: string; count: number }[] | undefined;
  states: string[] | undefined;
  qualificationsList: string[];
  onSubmit: (e: React.FormEvent) => void;
}

function FilterPanel({
  search, setSearch, category, setCategory, stateFilter, setStateFilter,
  qualification, setQualification, setPage, setIsMobileFiltersOpen,
  categories, states, qualificationsList, onSubmit,
}: FilterPanelProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Keywords..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Category</label>
        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
          <label className="flex items-center gap-3 cursor-pointer group py-1 rounded-lg px-2 hover:bg-primary/5 transition-colors">
            <input
              type="radio"
              name="category"
              value=""
              checked={category === ""}
              onChange={() => { setCategory(""); setPage(1); }}
              className="w-4 h-4 accent-primary"
            />
            <span className={cn("text-sm transition-colors", category === "" ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground")}>
              All Categories
            </span>
          </label>
          {categories?.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group py-1 rounded-lg px-2 hover:bg-primary/5 transition-colors">
              <input
                type="radio"
                name="category"
                value={cat.slug}
                checked={category === cat.slug}
                onChange={() => { setCategory(cat.slug); setPage(1); }}
                className="w-4 h-4 accent-primary"
              />
              <span className={cn("text-sm transition-colors flex-1", category === cat.slug ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground")}>
                {cat.name}
                <span className="ml-1 text-xs opacity-60">({cat.count})</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Location</label>
        <select
          value={stateFilter}
          onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
          className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors appearance-none cursor-pointer"
        >
          <option value="">All India</option>
          {states?.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Qualification */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Qualification</label>
        <select
          value={qualification}
          onChange={(e) => { setQualification(e.target.value); setPage(1); }}
          className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors appearance-none cursor-pointer"
        >
          <option value="">Any</option>
          {qualificationsList.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <div className="pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => {
            setSearch(""); setCategory(""); setStateFilter(""); setQualification(""); setPage(1);
            setIsMobileFiltersOpen(false);
          }}
          className="w-full py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors font-medium text-sm border border-border"
        >
          Reset Filters
        </button>
      </div>
    </form>
  );
}

export default function JobsPage() {
  const [locationStr] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [stateFilter, setStateFilter] = useState(searchParams.get("state") || "");
  const [qualification, setQualification] = useState(searchParams.get("qualification") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (stateFilter) params.set("state", stateFilter);
    if (qualification) params.set("qualification", qualification);
    if (page > 1) params.set("page", page.toString());
    const newUrl = `${locationStr}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [search, category, stateFilter, qualification, page, locationStr]);

  const { data: jobsData, isLoading } = useGetJobs({
    search: search || undefined,
    category: category || undefined,
    state: stateFilter || undefined,
    qualification: qualification || undefined,
    page,
    limit: 12,
  });

  const { data: categories } = useGetCategories();
  const { data: states } = useGetStates();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const qualificationsList = [
    "10th Pass", "12th Pass", "Graduate", "Post Graduate",
    "Diploma", "ITI", "B.Tech", "MBBS",
  ];

  const filterProps: FilterPanelProps = {
    search, setSearch, category, setCategory, stateFilter, setStateFilter,
    qualification, setQualification, setPage, setIsMobileFiltersOpen,
    categories, states, qualificationsList, onSubmit: handleSearchSubmit,
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 lg:pt-32 lg:pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">Find Jobs</h1>
            <p className="text-muted-foreground">Browse all verified government job notifications</p>
          </div>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-card border border-border text-foreground font-medium hover:border-primary/50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="glass-panel rounded-2xl p-5">
                <FilterPanel {...filterProps} />
              </div>
              {/* Sidebar Ad — 300×250 */}
              <AdUnit slot={AD_SLOTS.rectangle} size="rectangle" format="rectangle" />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col md:hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanel {...filterProps} />
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className="flex-1">
            {isLoading ? (
              <LoadingSpinner />
            ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
              <>
                {/* Mobile-only banner ad — top of results */}
                <div className="block md:hidden mb-4">
                  <AdUnit slot={AD_SLOTS.banner} size="leaderboard" format="horizontal" />
                </div>

                <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-muted-foreground text-sm">
                    Showing <span className="text-foreground font-semibold">{jobsData.total}</span> results
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 bg-muted/40 border border-border px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refreshes every 4 hours from official sources
                  </span>
                </div>

                <div className="space-y-6">
                  {/* First 3 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {jobsData.jobs.slice(0, 3).map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                  {/* Ad after 3 */}
                  {jobsData.jobs.length > 3 && (
                    <AdUnit slot={AD_SLOTS.banner} size="leaderboard" format="horizontal" />
                  )}
                  {/* Next 3 */}
                  {jobsData.jobs.length > 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {jobsData.jobs.slice(3, 6).map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
                  {/* Ad after 6 */}
                  {jobsData.jobs.length > 6 && (
                    <AdUnit slot={AD_SLOTS.banner} size="leaderboard" format="horizontal" />
                  )}
                  {/* Next 3 */}
                  {jobsData.jobs.length > 6 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {jobsData.jobs.slice(6, 9).map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
                  {/* Ad after 9 */}
                  {jobsData.jobs.length > 9 && (
                    <AdUnit slot={AD_SLOTS.rectangle} size="rectangle" format="rectangle" />
                  )}
                  {/* Remaining cards */}
                  {jobsData.jobs.length > 9 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {jobsData.jobs.slice(9).map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {jobsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-lg glass-panel hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 py-2 rounded-lg glass-panel font-medium text-foreground text-sm">
                      Page {page} of {jobsData.totalPages}
                    </div>
                    <button
                      disabled={page >= jobsData.totalPages}
                      onClick={() => setPage((p) => Math.min(jobsData.totalPages, p + 1))}
                      className="p-2 rounded-lg glass-panel hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center min-h-[50vh]">
                <img
                  src={`${import.meta.env.BASE_URL}images/empty-state.png`}
                  alt="Empty"
                  className="w-48 h-48 object-contain opacity-40 mb-6"
                />
                <h3 className="text-2xl font-bold text-foreground mb-2">No jobs match your criteria</h3>
                <p className="text-muted-foreground max-w-md">Try adjusting your filters or search terms to find more opportunities.</p>
                <button
                  onClick={() => { setSearch(""); setCategory(""); setStateFilter(""); setQualification(""); setPage(1); }}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
