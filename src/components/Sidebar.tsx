import { useQuery } from "@tanstack/react-query"
import { stepsQueryOptions } from "../util/steps"
import TanStackObservable from "./TanStackObservable"
import { Link } from "react-router"
import { stepQueryOptions } from "../util/steps"
import StateIndicator from "./StateIndicator"
import formatTime from "../util/formatTime"
import * as Types from "../lib/types"

export default function Sidebar() {
  const query = useQuery(stepsQueryOptions())

  return (
    <main className="p-2 flex-1 w-full max-w-sm max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="relative pb-6">
        <TanStackObservable isFetching={query.isFetching} name="Steps" />
        <div key={query.dataUpdatedAt}>
          <ul className="flex flex-col gap-2 divide-y divide-gray-200">
            {query.data?.map((step) => (
              <li key={step.name}>
                <Step step={step} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

function Step({ step }: { step: Types.StepType }) {
  const query = useQuery(stepQueryOptions(step.id, { initialData: step }))

  if (!query.data) {
    return null
  }

  return (
    <div className="relative">
      <TanStackObservable isFetching={query.isFetching} name={step.name} />
      <Link
        key={step.id}
        className="flex flex-col space-y-1 w-full font-medium cursor-pointer text-left relative"
        data-testid="step-item"
        to={`?sid=${step.id}`}
      >
        <div className="flex flex-1 justify-between items-center gap-2">
          <span className="font-medium text-sm">{query.data.name}</span>
          <StateIndicator state={query.data.state} />
        </div>
        {Boolean(query.dataUpdatedAt) && <p className="text-gray-400 text-xs">Last updated: {formatTime(query.dataUpdatedAt)}</p>}
      </Link>
    </div>
  )
}
