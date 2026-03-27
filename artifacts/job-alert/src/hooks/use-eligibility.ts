import { useQuery } from "@tanstack/react-query";
import type { JobListResponse } from "@workspace/api-client-react";

export interface EligibilityParams {
  age: number;
  qualification: string;
  category: string;
  page?: number;
  limit?: number;
}

// In production VITE_API_URL points to the Render backend (e.g. https://your-api.onrender.com).
// In local dev it is empty and the Vite proxy forwards /api/* to port 8080.
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function useCheckEligibility(params: EligibilityParams | null) {
  return useQuery<JobListResponse>({
    queryKey: ["eligibility", params],
    enabled: params !== null,
    queryFn: async () => {
      if (!params) throw new Error("No params");
      const qs = new URLSearchParams({
        age: String(params.age),
        qualification: params.qualification,
        category: params.category,
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 12),
      });
      const res = await fetch(`${API_BASE}/api/eligibility?${qs}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<JobListResponse>;
    },
  });
}
