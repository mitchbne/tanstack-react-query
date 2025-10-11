import { startCase } from "lodash"
import * as Types from "../lib/types"
import { clsx } from "clsx"

export default function StateIndicator({ state }: { state: Types.StateType }) {
  return (
    <span
      className={clsx(`font-medium px-1 py-0.25 rounded-md text-xs/4 border ${state}`, {
        "bg-gray-50 border-gray-200 text-gray-800": state === "scheduled",
        "bg-amber-50 border-amber-200 text-amber-700": state === "running",
        "bg-green-50 border-green-200 text-green-800": state === "passed",
        "bg-red-50 border-red-200 text-red-800": state === "failed",
      })}
    >
      {startCase(state)}
    </span>
  )
}
