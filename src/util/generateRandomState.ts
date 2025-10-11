import * as Types from "../lib/types"

export default function generateRandomState(): Types.StateType {
  const availableStates = ["passed", "failed", "running", "scheduled"] as Types.StateType[]
  return availableStates[Math.floor(Math.random() * availableStates.length)] as Types.StateType
}
