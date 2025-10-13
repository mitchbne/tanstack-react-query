import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"
import { AsyncBatcher } from "@tanstack/react-pacer"

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
    queryFn: () => fetchJobBatched(jobId),
    staleTime: Infinity,
    ...queryOptionArgs
  }

  return queryOptions(options)
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

async function fetchJobsByIds(ids: string[]): Promise<Types.JobType[]> {
  // your simulated network; replace with real fetch
  const promises = ids.map(
    (jobId) =>
      new Promise<Types.JobType>((resolve) => {
        setTimeout(() => {
          resolve({
            id: jobId,
            name: "Job #" + jobId.split("-")[1],
            step_uuid: `step-${Math.floor((parseInt(jobId.split("-")[1]) - 1) / 10) + 1}`,
            state: generateRandomState(),
          })
        }, 1000)
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
