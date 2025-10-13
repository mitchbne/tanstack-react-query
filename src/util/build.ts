import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"
import { asyncThrottle } from "@tanstack/react-pacer"

// A simple in-memory cache of throttled fetchers per build id so that multiple
// subscribers to the same build share the throttling window.
// Map of buildId -> throttled fetch function
// We intentionally keep the typing broad here since the asyncThrottle type
// definition exposed to us is not fully modeled in this file's context.
const buildThrottlers = new Map<string, (...args: any[]) => Promise<any>>()

// Wrap `fetchBuild` with a throttle so that rapid re-fetch requests within the
// wait window collapse into a single underlying fetch. We choose a 1s window
// here to showcase throttling (adjust as needed). Leading true so the first
// call executes immediately; trailing true so another call during the window
// schedules one more execution after the window (classic throttle w/ trailing).
export function throttleBuildFetch(buildId: string): Promise<Types.BuildType> {
  let throttled = buildThrottlers.get(buildId)

  if (!throttled) {
    throttled = asyncThrottle(
      () => fetchBuild(buildId),
      {
        wait: (throttler) => {
          console.log(throttler.store)
          return 1000
        },
        leading: true,
        trailing: true,
      }
    )
    buildThrottlers.set(buildId, throttled)
  }

  // Call the throttled function; it will handle collapsing rapid calls.
  return throttled()
}

export const buildQueryOptions = (buildId: string, queryOptionArgs: Omit<UseQueryOptions<Types.BuildType>, "queryKey" | "queryFn"> = {}) => {
  const options: UseQueryOptions<Types.BuildType> = {
    queryKey: ["build", buildId],
    queryFn: () => fetchBuild(buildId),
    staleTime: 0,
    ...queryOptionArgs
  }
  return queryOptions(options)
}

export const throttledBuildQueryOptions = (buildId: string, queryOptionArgs: Omit<UseQueryOptions<Types.BuildType>, "queryKey" | "queryFn"> = {}) => {
  const options: UseQueryOptions<Types.BuildType> = {
    queryKey: ["build", buildId],
    queryFn: () => throttleBuildFetch(buildId),
    staleTime: 0,
    ...queryOptionArgs
  }
  return queryOptions(options)
}

export function fetchBuild(buildId: string): Promise<Types.BuildType> {
  console.log(new Date().toISOString() + " Fetching " + buildId + "...")
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBuild = {
        id: buildId,
        name: "Build #42",
        number: 42,
        state: generateRandomState(),
        started_at: new Date(),
        finished_at: null,
      }

      resolve(newBuild)
    }, 2000)
  })
}
