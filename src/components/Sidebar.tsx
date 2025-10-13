import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAsyncQueuer } from "@tanstack/react-pacer"
import { stepDrawerQueryOptions, stepsQueryOptions } from "../util/steps"
import TanStackObservable from "./TanStackObservable"
import { Link } from "react-router"
import { stepQueryOptions } from "../util/steps"
import StateIndicator from "./StateIndicator"
import formatTime from "../util/formatTime"
import * as Types from "../lib/types"
import { useCallback, type MouseEventHandler } from "react"

export default function Sidebar() {
  const queryClient = useQueryClient()
  const query = useQuery(stepsQueryOptions())

  const prefetchStepDrawer = useCallback(async (stepId: Types.StepType["id"]) => {
    await queryClient.ensureQueryData(stepDrawerQueryOptions(stepId))
  }, [])

  const prefetchStepDrawerQueue = useAsyncQueuer(prefetchStepDrawer, {
    addItemsTo: "front", // newest hovered link is top priority
    maxSize: 2, // only prefetch 2 links at a time
    wait: 300,
    expirationDuration: 500, // If a link was hovered over 500ms ago, and still hasn't been prefetched, remove it from the queue
  })

  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const stepId = event.currentTarget.id
    prefetchStepDrawerQueue.addItem(stepId) // add the hovered step to the queuer
  }, [])

  return (
    <main className="p-2 flex-1 w-full max-w-sm max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="relative pb-6">
        <TanStackObservable isFetching={query.isFetching} name="Steps" />
        <div key={query.dataUpdatedAt}>
          <ul className="flex flex-col gap-2 divide-y divide-gray-200">
            {query.data?.map((step) => (
              <li key={step.name}>
                <Step step={step} handleMouseEnter={handleMouseEnter} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

function Step({ step, handleMouseEnter }: { step: Types.StepType; handleMouseEnter: MouseEventHandler<HTMLAnchorElement> }) {
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
        id={step.id}
        onMouseMove={handleMouseEnter}
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
