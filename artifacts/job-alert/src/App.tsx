import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setBaseUrl } from "@workspace/api-client-react";

// Pages
import Home from "@/pages/home";
import JobsPage from "@/pages/jobs";
import JobDetailPage from "@/pages/job-detail";
import StatesPage from "@/pages/states";
import BookmarksPage from "@/pages/bookmarks";
import EligibilityPage from "@/pages/eligibility";
import NotFound from "@/pages/not-found";
import TermsPage from "@/pages/terms";

// Point all API calls to the backend URL when running outside of the dev proxy
// (e.g. on Vercel pointing to a Render API server).
// In local dev the Vite proxy handles /api/* so this stays empty.
const apiUrl = import.meta.env.VITE_API_URL ?? "";
setBaseUrl(apiUrl || null);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/jobs" component={JobsPage} />
        <Route path="/jobs/:id" component={JobDetailPage} />
        <Route path="/states" component={StatesPage} />
        <Route path="/bookmarks" component={BookmarksPage} />
        <Route path="/eligibility" component={EligibilityPage} />
        <Route path="/terms" component={TermsPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
