import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"

export const jobsQueryOptions = () => {
  return queryOptions({
    queryKey: ["jobs"],
    queryFn: () => fetchJobs(),
    staleTime: 0,
  })
}

export const jobQueryOptions = (jobId: Types.JobType["id"], queryOptionArgs: Omit<UseQueryOptions<Types.JobType>, "queryKey" | "queryFn"> = {}) => {
  if (!jobId && queryOptionArgs.enabled !== false) {
    throw new Error("jobId is required")
  }

  const options: UseQueryOptions<Types.JobType> = {
    queryKey: ["jobs", jobId],
    queryFn: () => fetchJob(jobId),
    staleTime: Infinity,
    ...queryOptionArgs
  }

  return queryOptions(options)
}

export function fetchJob(jobId: Types.JobType["id"]): Promise<Types.JobType> {
  console.log(new Date().toISOString() + ` Fetching ${jobId}...`)

  return new Promise((resolve) => {
    setTimeout(() => {
      const newJob = {
        id: jobId,
        name: "Job #" + jobId.split("-")[1],
        step_uuid: `step-${Math.floor((parseInt(jobId.split("-")[1]) - 1) / 10) + 1}`,
        state: generateRandomState(),
      }

      resolve(newJob)
    }, 2000)
  })
}

export function fetchJobs(): Promise<Types.JobType[]> {
  console.log(new Date().toISOString() + " Fetching Jobs...")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Array.from({ length: 100 }, (_, i) => i + 1).map((i) => ({
          id: `job-${i}`,
          name: `Job #${i}`,
          step_uuid: `step-${Math.floor((i - 1) / 10) + 1}`,
          state: generateRandomState(),
        }))
      )

    }, 2000)
  })
}
