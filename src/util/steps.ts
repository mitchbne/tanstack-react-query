import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"
import { AsyncBatcher } from "@tanstack/react-pacer"

export const stepsQueryOptions = () => {
  return queryOptions({
    queryKey: ["steps"],
    queryFn: () => fetchSteps(),
    staleTime: 0,
  })
}

export const stepQueryOptions = (stepId: Types.StepType["id"], queryOptionArgs: Omit<UseQueryOptions<Types.StepType>, "queryKey" | "queryFn"> = {}) => {
  if (!stepId && queryOptionArgs.enabled !== false) {
    throw new Error("stepId is required")
  }

  const options: UseQueryOptions<Types.StepType> = {
    queryKey: ["steps", stepId],
    queryFn: () => fetchStepBatched(stepId),
    staleTime: Infinity,
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
    }, 2000)
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
        }, 1000)
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
