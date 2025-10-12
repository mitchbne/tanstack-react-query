import { queryOptions, type UseQueryOptions } from "@tanstack/react-query"
import * as Types from "../lib/types"
import generateRandomState from "./generateRandomState"

export const buildQueryOptions = (queryOptionArgs: Omit<UseQueryOptions<Types.BuildType>, "queryKey" | "queryFn"> = {}) => {
  const options: UseQueryOptions<Types.BuildType> = {
    queryKey: ["build"],
    queryFn: () => fetchBuild(),
    staleTime: 0,
    ...queryOptionArgs
  }

  return queryOptions(options)
}

export function fetchBuild(): Promise<Types.BuildType> {
  console.log(new Date().toISOString() + " Fetching build...")
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBuild = {
        id: "build-1",
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
