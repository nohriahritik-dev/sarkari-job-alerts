import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] w-full gap-4 text-muted-foreground">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="animate-pulse font-medium text-sm tracking-widest uppercase">Loading...</p>
    </div>
  );
}
