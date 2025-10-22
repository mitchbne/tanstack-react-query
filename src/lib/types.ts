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



type BuildChannelEventType =
  | "updated"
  | "started"
  | "finished"
  | "skipped"
  | "canceling"
  | "commit:changed"
  | "pipeline:changed"
  | "steps:changed"
  | "annotations:changed";

type StepsChangedMessage = { event: "steps:changed"; step_uuids: string[] };
type PipelineChangedMessage = {
  event: "pipeline:changed";
  step_added_uuids: string[];
  step_changed_uuids: string[];
};
type BuildChannelMessage =
  | { event: Omit<BuildChannelEventType, "steps:changed" | "pipeline:changed"> }
  | PipelineChangedMessage
  | StepsChangedMessage;

export type RefetchBuildQueueItem = {
  event: BuildChannelMessage["event"]
  receivedAt: number
  priority: number
  wait: number
}

export type EventType = {
  id: string
  type: string
  timestamp: Date
  step_uuids: StepType["id"][]
  message: string
}

export type StepDrawerReturnType = {
  step: StepType
  jobs: JobType[]
}

export type JobDrawerReturnType = JobType[]
