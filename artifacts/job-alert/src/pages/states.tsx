import { Link } from "wouter";
import { Map, ChevronRight } from "lucide-react";
import { useGetStates } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { LoadingSpinner } from "@/components/ui/loading";
import { AdUnit } from "@/components/ad-unit";

export default function StatesPage() {
  const { data: states, isLoading } = useGetStates();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Jobs by State</h1>
          <p className="text-lg text-muted-foreground">
            Browse verified government job opportunities categorized by Indian states and union territories.
          </p>
        </div>

        {/* Ad above grid */}
        <AdUnit slot="6300978111" size="leaderboard" format="horizontal" className="mb-8" />

        {isLoading ? (
          <LoadingSpinner />
        ) : states && states.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {states.map((state) => (
              <Link 
                key={state}
                href={`/jobs?state=${encodeURIComponent(state)}`}
                className="group glass-panel p-6 rounded-2xl flex items-center justify-between hover:-translate-y-1 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Map className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {state}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        ) : null}

        {/* Ad below grid */}
        {states && states.length > 0 && (
          <AdUnit slot="6300978111" size="leaderboard" format="horizontal" className="mt-8" />
        )}

        {!isLoading && (!states || states.length === 0) && (
          <div className="glass-panel p-12 rounded-2xl text-center">
            <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground mb-2">No States Found</h3>
            <p className="text-muted-foreground">State data is currently unavailable.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
