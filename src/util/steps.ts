import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"
import { AsyncBatcher } from "@tanstack/react-pacer"

export const stepsQueryKey = () => ["steps"]

export const stepsQueryOptions = () => {
  return queryOptions({
    queryKey: stepsQueryKey(),
    queryFn: () => fetchSteps(),
    refetchOnWindowFocus: "always",
  })
}

export const stepQueryKey = (stepId: Types.StepType["id"]) => {
  return ["steps", stepId]
}

export const stepQueryOptions = (stepId: Types.StepType["id"], queryOptionArgs: Omit<UseQueryOptions<Types.StepType>, "queryKey" | "queryFn"> = {}) => {
  if (!stepId && queryOptionArgs.enabled !== false) {
    throw new Error("stepId is required")
  }

  const options: UseQueryOptions<Types.StepType> = {
    queryKey: stepQueryKey(stepId),
    queryFn: () => fetchStepBatched(stepId),
    ...queryOptionArgs
  }

  return queryOptions(options)
}

export const stepDrawerQueryKey = (stepId: Types.StepType["id"]) => {
  return ["steps", stepId, "step-drawer"]
}

export const stepDrawerQueryOptions = (stepId: Types.StepType["id"], queryOptionArgs: Omit<UseQueryOptions<Types.StepDrawerReturnType>, "queryKey" | "queryFn"> = {}) => {
  if (!stepId && queryOptionArgs.enabled !== false) {
    throw new Error("jobId is required")
  }

  const options: UseQueryOptions<Types.StepDrawerReturnType> = {
    queryKey: stepDrawerQueryKey(stepId),
    queryFn: () => fetchStepDrawer(stepId),
    refetchOnWindowFocus: "always",
    ...queryOptionArgs
  }

  return queryOptions(options)
}

export function fetchSteps(): Promise<Types.StepType[]> {
  console.log(new Date().toISOString() + " Fetching Steps...")
  return new Promise((resolve) => {
    setTimeout(() => {
      const steps = Array.from({ length: 10 }, (_, i) => i + 1).map((i) => ({
        id: `step-${i}`,
        name: `Step #${i}`,
        state: generateRandomState(),
      }))
      resolve(steps)
    }, 500)
  })
}

async function fetchStepsByIds(ids: string[]): Promise<Types.StepType[]> {
  // your simulated network; replace with real fetch
  const promises = ids.map(
    (stepId) =>
      new Promise<Types.StepType>((resolve) => {
        setTimeout(() => {
          resolve({
            id: stepId,
            name: 'Step #' + stepId.split('-')[1],
            state: generateRandomState(),
          })
        }, 500)
      }),
  )
  return Promise.all(promises)
}

type BatchItem = {
  id: string
  resolve: (step: Types.StepType) => void
  reject: (err: unknown) => void
}

const stepsBatcher = new AsyncBatcher<BatchItem>(
  async (items) => {
    console.log("Fetching batch of steps:", items.map(i => i.id).join(", "));
    const ids = items.map((it) => it.id)
    const steps = await fetchStepsByIds(ids)
    const byId = new Map(steps.map((p) => [String(p.id), p]))

    // Resolve each deferred with the matching Step or reject if missing
    const orderedSteps: Types.StepType[] = items.reduce((acc, item) => {
      const hit = byId.get(String(item.id))
      if (!hit) { throw new Error(`Step ${item.id} missing from batch response`) }
      item.resolve(hit)
      acc.push(hit)
      return acc
    }, [] as Types.StepType[])

    // Return the ordered steps so that onSuccess can use it if needed
    return orderedSteps
  },
  {
    maxSize: 50,
    wait: 20,
    throwOnError: false, // we handle per-item errors via reject()
  },
)

export function fetchStepBatched(id: string): Promise<Types.StepType> {
  return new Promise<Types.StepType>((resolve, reject) => {
    stepsBatcher.addItem({ id: String(id), resolve, reject })
  })
}

export async function fetchStepDrawer(stepId: string): Promise<Types.StepDrawerReturnType> {
  console.log(new Date().toISOString() + " Fetching Step drawer for " + stepId + "...")
  return new Promise((resolve) => {
    setTimeout(() => {
      const step = {
        id: stepId,
        name: 'Step #' + stepId.split('-')[1],
        state: generateRandomState(),
      }

      const jobs = Array.from({ length: 10 }, (_, i) => i + 1).map((i) => {
        const jobIdNumber = (parseInt(stepId.split("-")[1]) - 1) * 10 + i
        const jobRetriedIn = jobIdNumber % 10 === 0 ? null : `job-${jobIdNumber + 1}`
        return {
          id: `job-${jobIdNumber}`,
          name: "Job #" + jobIdNumber,
          step_uuid: stepId,
          jobRetriedIn,
          state: generateRandomState(),
        }
      })

      resolve({ step, jobs } satisfies Types.StepDrawerReturnType)
    }, 500)
  })
}
