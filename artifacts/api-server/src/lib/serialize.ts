import type { Job } from "@workspace/db";

export function serializeJob(job: Job) {
  return {
    ...job,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
