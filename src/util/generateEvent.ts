import * as Types from "../lib/types"

export default function generateEvent(): Types.EventType {
  // Generate steps changed. This is an array of StepType["id"]s that have changed.
  // Create up to 3 random step IDs between 1 and 10
  const step_uuids = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => Math.floor(Math.random() * 10) + 1)
  const unique_step_uuids = Array.from(new Set(step_uuids))
    .sort((a, b) => a - b)
    .map((id) => `step-${id}`) // Ensure they are unique and sorted

  return {
    id: crypto.randomUUID(),
    type: "steps:changed",
    step_uuids: unique_step_uuids,
    message: "The following steps have changed:\n" + unique_step_uuids.join(", "),
    timestamp: new Date(),
  }
}
