import { createContext, useContext } from "react"
import * as Types from "./types"

type BuildContextType = {
  build: Types.BuildType
  simulateRunningBuild: boolean
  setSimulateRunningBuild: (simulate: boolean) => void
  events: Types.EventType[]
}

export const BuildContext = createContext<BuildContextType | null>(null)

export function useBuild(): BuildContextType {
  const buildContext = useContext(BuildContext)

  if (!buildContext) {
    throw new Error("useBuild must be used within a BuildContextProvider")
  }

  return buildContext
}
