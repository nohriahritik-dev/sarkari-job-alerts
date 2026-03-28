import { Link, useLocation } from "wouter";
import { Briefcase, Map, Bookmark, Menu, X, Home, Sun, Moon, CheckCircle2, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { StickyAdBar } from "@/components/sticky-ad-bar";
import { AppDownloadBanner } from "@/components/app-download-banner";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/eligibility", label: "Eligibility", icon: CheckCircle2 },
    { href: "/states", label: "States", icon: Map },
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  ];

  const navItemClass = isScrolled
    ? "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
    : "text-white/80 hover:text-white hover:bg-white/10";

  const brandTextClass = isScrolled ? "text-foreground" : "text-white";

  const toggleBtnClass = isScrolled
    ? "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
    : "text-white/80 hover:text-white hover:bg-white/10";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
            : "bg-[#0A1628]/80 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Sarkari Job Alerts"
                className="w-10 h-10 rounded-xl object-cover shadow-md"
              />
              <span className={cn("font-display font-bold text-xl tracking-tight transition-colors duration-300", brandTextClass)}>
                Sarkari Job <span className="text-primary">Alerts</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  location === link.href ||
                  (link.href !== "/" && location.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2",
                      isActive ? "bg-primary/10 text-primary" : navItemClass
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Light / Dark Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle light/dark mode"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={cn(
                  "ml-2 p-2.5 rounded-lg transition-all duration-200",
                  toggleBtnClass
                )}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Get App CTA */}
              <a
                href="https://play.google.com/store/apps/details?id=com.sarkarialert"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all duration-200"
              >
                <Smartphone className="w-4 h-4" />
                Get App
              </a>
            </nav>

            {/* Mobile: toggle + hamburger */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                className="p-2 text-white/80 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-40 bg-card border-b border-border shadow-2xl md:hidden"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive =
                  location === link.href ||
                  (link.href !== "/" && location.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-3",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              {/* Get App — mobile menu */}
              <a
                href="https://play.google.com/store/apps/details?id=com.sarkarialert"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-1 px-4 py-3 rounded-xl font-semibold text-sm bg-primary text-white flex items-center gap-3 hover:bg-primary/90 transition-colors"
              >
                <Smartphone className="w-5 h-5" />
                Download App on Google Play
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pb-[76px]">{children}</main>

      {/* Sticky Bottom Ad */}
      <StickyAdBar />

      {/* App Download Banner — shown on every page */}
      <section className="bg-[#0A1628] py-14 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Text side */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Mobile App
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-4">
                Get a Better Experience<br />
                <span className="text-primary">on the App</span>
              </h2>
              <ul className="space-y-2 text-white/70 text-sm mb-8 text-left inline-block">
                {[
                  "Instant push notifications for new jobs",
                  "One-tap apply with saved profile",
                  "Offline access to bookmarked jobs",
                  "Cleaner UI designed for mobile",
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
              <a
                href="https://play.google.com/store/apps/details?id=com.sarkarialert"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-14 w-auto hover:opacity-90 transition-opacity"
                />
              </a>
            </div>

            {/* Phone mockup side */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative w-40 h-64 md:w-48 md:h-80">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 border-2 border-white/20 shadow-2xl flex flex-col items-center justify-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <Smartphone className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white font-bold text-sm text-center">Sarkari Job Alerts</p>
                  <p className="text-white/50 text-xs text-center">4.5 ★ on Play Store</p>
                  <div className="w-full h-px bg-white/10" />
                  <div className="space-y-2 w-full">
                    {["SSC CGL 2026", "UPSC IAS", "Railway Jobs"].map((t) => (
                      <div key={t} className="bg-white/10 rounded-lg px-2 py-1.5 text-white/70 text-xs">{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Sarkari Job Alerts"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-display font-bold text-lg text-foreground">
                Sarkari Job <span className="text-primary">Alerts</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} Sarkari Job Alerts &mdash; Real-time government job notifications for India.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Terms &amp; Conditions
              </Link>
              <span className="text-muted-foreground/30 text-xs">|</span>
              <p className="text-xs text-muted-foreground">
                Data sourced from official recruitment boards
              </p>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-8 pt-6 border-t border-border border-dashed text-center max-w-4xl mx-auto">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Disclaimer
            </h4>
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              Sarkari Job Alerts is a private entity and is <strong>NOT associated, affiliated, or registered with any State Government, Central Government, or any official government portal/board</strong>. We collect public information from official websites and employment newspapers strictly for informational purposes. We do not guarantee the completeness or accuracy of any information. Sarkari Job Alerts and its creators shall not be held liable for any loss, damage, or legal consequences arising from the use of the information provided on this website. Users are advised to verify details with the respective official government portals before applying or taking any action.
            </p>
          </div>
        </div>
      </footer>
      <AppDownloadBanner />
    </div>
  );
}
