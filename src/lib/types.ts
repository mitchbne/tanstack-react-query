export type StateType = "passed" | "failed" | "running" | "scheduled"

export type BuildType = {
  id: string
  name: string
  number: number
  state: StateType
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
  jobRetriedIn: JobType["id"] | null
  state: StateType
}

export type EventType = {
  id: string
  type: string
  timestamp: Date
  step_uuids: StepType["id"][]
  message: string
}
