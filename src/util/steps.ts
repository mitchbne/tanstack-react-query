import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"

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
    queryFn: () => fetchStep(stepId),
    staleTime: Infinity,
    ...queryOptionArgs
  }

  return queryOptions(options)
}

export function fetchStep(stepId: Types.StepType["id"]): Promise<Types.StepType> {
  console.log(new Date().toISOString() + ` Fetching ${stepId}...`)

  return new Promise((resolve) => {
    setTimeout(() => {
      const newStep = {
        id: stepId,
        name: "Step #" + stepId.split("-")[1],
        state: generateRandomState(),
      }

      resolve(newStep)
    }, 2000)
  })
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
