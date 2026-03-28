import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Search, ChevronRight, Briefcase, CheckCircle2, TrendingUp, Filter, BadgeCheck, Users,
  FlaskConical, Stethoscope, GraduationCap, Scale, Shield, Wrench, Code2,
  Banknote, Building2, HardHat, FileText, Factory, Hammer, BookOpen,
  ShieldCheck, Landmark, School, HeartPulse, Train, TreePine, Lock,
  Trophy, MoreHorizontal, RefreshCw, Bell, type LucideIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGetJobs, useGetJobCount, useGetClosingSoonJobs, useGetCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { JobCard } from "@/components/job-card";
import { LoadingSpinner } from "@/components/ui/loading";
import { getCategoryColor, cn } from "@/lib/utils";
import { useState } from "react";
import { AdUnit, AD_SLOTS } from "@/components/ad-unit";
import { NewUpdatesSection } from "@/components/new-updates-section";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "research-science":    FlaskConical,
  "medical":             Stethoscope,
  "management-admin":    Briefcase,
  "teaching":            GraduationCap,
  "judiciary":           Scale,
  "defence":             Shield,
  "technical-iti":       Wrench,
  "it-software":         Code2,
  "finance-accounts":    Banknote,
  "banking":             Building2,
  "engineering":         HardHat,
  "clerk-typist":        FileText,
  "psu":                 Factory,
  "apprentice":          Hammer,
  "ssc":                 BookOpen,
  "police":              ShieldCheck,
  "state-govt":          Landmark,
  "education-training":  School,
  "healthcare-support":  HeartPulse,
  "railways":            Train,
  "agriculture-forestry":TreePine,
  "law-security":        Lock,
  "upsc":                Trophy,
  "other":               MoreHorizontal,
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: countData } = useGetJobCount();
  const { data: categories } = useGetCategories();
  const { data: closingSoon, isLoading: isClosingLoading } = useGetClosingSoonJobs();
  const { data: latestJobs, isLoading: isLatestLoading } = useGetJobs({ limit: 6 });

  return (
    <Layout>
      {/* Hero Section — always dark navy regardless of theme */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden bg-[#0A1628]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Hero background" 
            className="w-full h-full object-cover opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1628]/40 via-[#0A1628]/80 to-[#0A1628]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <BadgeCheckIcon /> 100% Verified Govt Jobs
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 leading-tight">
              Secure Your Future in <br />
              <span className="text-gradient-saffron">Public Service</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The most reliable portal for SSC, UPSC, Banking, Defence, and State Government job notifications.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-2xl">
                <Search className="w-6 h-6 text-white/60 ml-3 shrink-0" />
                <input 
                  type="text"
                  placeholder="Search by job title, department, or keyword..."
                  className="w-full bg-transparent border-none text-white placeholder:text-white/50 px-4 py-3 focus:outline-none focus:ring-0 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      window.location.href = `/jobs?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
                <Link 
                  href={`/jobs${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors shrink-0"
                >
                  Search
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto mt-16"
          >
            {[
              { label: "Active Jobs", value: countData?.count ? countData.count.toLocaleString("en-IN") : "—", icon: Briefcase },
              {
                label: "Total Vacancies",
                value: countData?.totalVacancies
                  ? countData.totalVacancies.toLocaleString("en-IN")
                  : "—",
                icon: Users,
              },
              { label: "Sectors", value: categories?.length ? `${categories.length}` : "24", icon: Filter },
              { label: "Fastest Notification", value: "Instant", icon: Bell },
              { label: "Verified Sources", value: "100%", icon: CheckCircle2 },
            ].map((stat, i) => (
              <div key={i} className="hero-glass p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <stat.icon className="w-6 h-6 text-primary mb-2" />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Last updated note */}
          {countData?.lastUpdated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-4 text-xs text-white/40"
            >
              <Bell className="w-3 h-3" />
              <span>
                Instant job alerts · Last updated{" "}
                {formatDistanceToNow(new Date(countData.lastUpdated), { addSuffix: true })}
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Ad — below hero, above categories */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdUnit slot={AD_SLOTS.banner} size="leaderboard" format="horizontal" />
      </div>

      {/* New Updates Section */}
      {!!latestJobs?.jobs?.length && (
        <NewUpdatesSection jobs={latestJobs.jobs} />
      )}

      {/* Categories */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Browse by Sector</h2>
              <p className="text-muted-foreground">Find opportunities that match your expertise</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories?.filter(cat => cat.slug !== "other").map((cat) => {
              const colorClass = getCategoryColor(cat.slug);
              const Icon = CATEGORY_ICONS[cat.slug] ?? Briefcase;
              return (
                <Link 
                  key={cat.slug} 
                  href={`/jobs?category=${cat.slug}`}
                  className="glass-panel p-4 rounded-2xl hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group text-center flex flex-col items-center gap-3"
                >
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border", colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.count} openings</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ad — between categories and closing soon */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdUnit slot={AD_SLOTS.rectangle} size="rectangle" format="rectangle" />
      </div>

      {/* Closing Soon Strip */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-8 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-3xl font-display font-bold text-foreground">Closing Soon</h2>
            <Link href="/jobs" className="ml-auto text-sm font-semibold text-primary hover:text-foreground transition-colors flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {isClosingLoading ? (
            <LoadingSpinner />
          ) : closingSoon && closingSoon.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {closingSoon.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl text-center">
              <p className="text-muted-foreground">No jobs closing in the next 3 days.</p>
            </div>
          )}
        </div>
      </section>

      {/* Ad — between Closing Soon and Latest Jobs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <AdUnit slot={AD_SLOTS.banner} size="leaderboard" format="horizontal" />
      </div>

      {/* Latest Jobs */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-display font-bold text-foreground">Latest Notifications</h2>
            <Link href="/jobs" className="text-sm font-semibold text-primary hover:text-foreground transition-colors flex items-center">
              Browse All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {isLatestLoading ? (
            <LoadingSpinner />
          ) : latestJobs?.jobs && latestJobs.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
               <img 
                 src={`${import.meta.env.BASE_URL}images/empty-state.png`} 
                 alt="Empty" 
                 className="w-48 h-48 object-contain opacity-50 mb-6" 
               />
               <p className="text-xl text-foreground font-medium">No jobs found</p>
               <p className="text-muted-foreground mt-2">Check back later for new notifications.</p>
            </div>
          )}
        </div>
      </section>

      {/* Ad — below Latest Jobs, above App Download / Footer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdUnit slot={AD_SLOTS.large} size="large" format="horizontal" />
      </div>

    </Layout>
  );
}

function BadgeCheckIcon() {
  return <BadgeCheck className="w-4 h-4" />;
}
