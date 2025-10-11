export type StateType = "passed" | "failed" | "running" | "scheduled"

export type BuildType = {
  id: string
  number: number
  state: "running" | "passed" | "failed"
  started_at: Date
  finished_at: Date | null
}

export type StepType = {
  id: string
  name: string
  state: StateType
}

export type JobType = {
  id: string
  name: string
  step_uuid: string
  state: StateType
}

export type EventType = {
  id: string
  type: string
  timestamp: Date
  step_uuids: StepType["id"][]
  message: string
}
