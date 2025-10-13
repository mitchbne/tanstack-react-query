import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"

export const buildQueryOptions = (buildId: string, queryOptionArgs: Omit<UseQueryOptions<Types.BuildType>, "queryKey" | "queryFn"> = {}) => {
  const options: UseQueryOptions<Types.BuildType> = {
    queryKey: ["build", buildId],
    queryFn: () => fetchBuild(buildId),
    refetchOnWindowFocus: "always",
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
    }, 500)
  })
}
