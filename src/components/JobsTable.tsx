import { useQuery, useQueryClient } from "@tanstack/react-query"
import { jobDrawerQueryOptions, jobsQueryOptions } from "../util/jobs"
import { jobQueryOptions } from "../util/jobs"
import StateIndicator from "./StateIndicator"
import TanStackObservable from "./TanStackObservable"
import { useNavigate } from "react-router"
import * as Types from "../lib/types"
import { useAsyncQueuer } from "@tanstack/react-pacer"
import { useCallback } from "react"

export default function JobsTable() {
  const queryClient = useQueryClient()
  const query = useQuery(jobsQueryOptions())

  const prefetchJobDrawer = useCallback(async (jobId: Types.JobType["id"]) => {
    await queryClient.ensureQueryData(jobDrawerQueryOptions(jobId))
  }, [])

  const prefetchJobDrawerQueue = useAsyncQueuer(prefetchJobDrawer, {
    addItemsTo: "front", // newest hovered link is top priority
    maxSize: 2, // only prefetch 2 links at a time
    wait: 300,
    expirationDuration: 500, // If a link was hovered over 500ms ago, and still hasn't been prefetched, remove it from the queue
  })

  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLTableRowElement>) => {
    const jobId = event.currentTarget.id
    prefetchJobDrawerQueue.addItem(jobId) // add the hovered step to the queuer
  }, [])

  return (
    <div className="w-full flex-1 relative">
      <TanStackObservable isFetching={query.isFetching} name="Jobs" position="top-right" />
      <table className="w-full divide-y divide-gray-300 text-sm text-gray-600">
        <tbody>
          {query.data?.map((job) => (
            <Job key={job.id} job={job} handleMouseEnter={handleMouseEnter} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Job({ job, handleMouseEnter }: { job: Types.JobType; handleMouseEnter: (event: React.MouseEvent<HTMLTableRowElement>) => void }) {
  const navigate = useNavigate()
  const query = useQuery(jobQueryOptions(job.id, { initialData: job }))

  if (!query.data) {
    return null
  }

  return (
    <tr
      className="border-b w-full border-gray-200 last-of-type:border-b-0 relative cursor-pointer hover:bg-gray-50"
      onMouseEnter={handleMouseEnter}
      id={job.id}
      onClick={() => {
        navigate(`?jid=${job.id}`)
      }}
    >
      <td className="p-2 font-medium">{query.data.name}</td>
      <td className="p-2 font-mono">{query.data.step_uuid}</td>
      <td className="p-2">
        <StateIndicator state={query.data.state} />
      </td>
      <td className="p-2">
        {query.data.jobRetriedIn && (
          <>
            Retried in <span className="font-mono">{query.data.jobRetriedIn}</span>
          </>
        )}
      </td>
      <td className="p-2 text-right relative w-48">
        <TanStackObservable isFetching={query.isFetching} name={job.name} />
      </td>
    </tr>
  )
}
