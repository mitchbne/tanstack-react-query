import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"
import { AsyncBatcher } from "@tanstack/react-pacer"

// Fetching all jobs
export const jobsQueryKey = () => ["jobs"]

export const jobsQueryOptions = () => {
  return queryOptions({
    queryKey: jobsQueryKey(),
    queryFn: () => fetchJobs(),
    refetchOnWindowFocus: "always",
  })
}

export function fetchJobs(): Promise<Types.JobType[]> {
  console.log(new Date().toISOString() + " Fetching Jobs...")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Array.from({ length: 100 }, (_, i) => i + 1).map((i) => {
        const stepNumber = Math.floor((i - 1) / 10) + 1
        const jobRetriedIn = i % 10 === 0 ? null : `job-${i + 1}`
        return  {
          id: `job-${i}`,
          name: `Job #${i}`,
          step_uuid: `step-${stepNumber}`,
          jobRetriedIn,
          state: generateRandomState(),
        }
      })
      )

    }, 500)
  })
}

// Fetching a single job by ID
export const jobQueryKey = (jobId: Types.JobType["id"]) => {
  return ["jobs", jobId]
}

export const jobQueryOptions = (jobId: Types.JobType["id"], queryOptionArgs: Omit<UseQueryOptions<Types.JobType>, "queryKey" | "queryFn"> = {}) => {
  if (!jobId && queryOptionArgs.enabled !== false) {
    throw new Error("jobId is required")
  }

  const options: UseQueryOptions<Types.JobType> = {
    queryKey: jobQueryKey(jobId),
    queryFn: () => fetchJobBatched(jobId),
    ...queryOptionArgs
  }

  return queryOptions(options)
}

async function fetchJobsByIds(ids: string[]): Promise<Types.JobType[]> {
  // your simulated network; replace with real fetch
  const promises = ids.map(
    (jobId) =>
      new Promise<Types.JobType>((resolve) => {
        setTimeout(() => {
          const jobIdNumber = parseInt(jobId.split("-")[1])
          const stepNumber = Math.floor((jobIdNumber - 1) / 10) + 1
          const jobRetriedIn = jobIdNumber % 10 === 0 ? null : `job-${jobIdNumber + 1}`
          resolve({
            id: jobId,
            name: "Job #" + jobId.split("-")[1],
            step_uuid: `step-${stepNumber}`,
            jobRetriedIn,
            state: generateRandomState(),
          })
        }, 500)
      }),
  )
  return Promise.all(promises)
}

type BatchItem = {
  id: string
  resolve: (job: Types.JobType) => void
  reject: (err: unknown) => void
}

const jobsBatcher = new AsyncBatcher<BatchItem>(
  async (items) => {
    // console.log("Fetching batch of jobs:", items.map(i => i.id).join(", "));
    const ids = items.map((it) => it.id)
    const jobs = await fetchJobsByIds(ids)
    const byId = new Map(jobs.map((p) => [String(p.id), p]))

    // Resolve each deferred with the matching Job or reject if missing
    const orderedJobs: Types.JobType[] = items.reduce((acc, item) => {
      const hit = byId.get(String(item.id))
      if (!hit) { throw new Error(`Job ${item.id} missing from batch response`) }
      item.resolve(hit)
      acc.push(hit)
      return acc
    }, [] as Types.JobType[])

    // Return the ordered jobs so that onSuccess can use it if needed
    return orderedJobs
  },
  {
    maxSize: 50,
    wait: 20,
    throwOnError: false, // we handle per-item errors via reject()
  },
)

export function fetchJobBatched(id: string): Promise<Types.JobType> {
  return new Promise<Types.JobType>((resolve, reject) => {
    jobsBatcher.addItem({ id: String(id), resolve, reject })
  })
}

// Fetching job-drawer data
export const jobDrawerQueryKey = (jobId: Types.JobType["id"]) => {
  return ["jobs", jobId, "job-drawer"]
}

export const jobDrawerQueryOptions = (jobId: Types.JobType["id"], queryOptionArgs: Omit<UseQueryOptions<Types.JobDrawerReturnType>, "queryKey" | "queryFn"> = {}) => {
  if (!jobId && queryOptionArgs.enabled !== false) {
    throw new Error("jobId is required")
  }

  const options: UseQueryOptions<Types.JobDrawerReturnType> = {
    queryKey: jobDrawerQueryKey(jobId),
    queryFn: () => fetchJobDrawer(jobId),
    refetchOnWindowFocus: "always",
    ...queryOptionArgs
  }

  return queryOptions(options)
}

export function fetchJobDrawer(jobId: Types.JobType["id"]): Promise<Types.JobDrawerReturnType> {
  console.log(new Date().toISOString() + " Fetching Job Drawer for " + jobId + "...")
  return new Promise((resolve) => {
    setTimeout(() => {
      const stepNumber = Math.floor((parseInt(jobId.split("-")[1]) - 1) / 10) + 1
      const jobsInStep = Array.from({ length: 10 }, (_, i) => i + 1 + (stepNumber - 1) * 10).map((i) => {
        const jobRetriedIn = i % 10 === 0 ? null : `job-${i + 1}`
        return  {
          id: `job-${i}`,
          name: `Job #${i}`,
          step_uuid: `step-${stepNumber}`,
          jobRetriedIn,
          state: generateRandomState(),
        }
      })
      resolve(jobsInStep satisfies Types.JobDrawerReturnType)
    }, 500)
  })
}
