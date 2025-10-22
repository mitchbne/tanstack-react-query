import { useQuery, useQueryClient } from "@tanstack/react-query"
import { jobDrawerQueryOptions, jobsQueryOptions } from "../util/jobs"
import { jobQueryOptions } from "../util/jobs"
import StateIndicator from "./StateIndicator"
import TanStackObservable from "./TanStackObservable"
import { useNavigate } from "react-router"
import * as Types from "../lib/types"
import { useDebouncedValue } from "@tanstack/react-pacer"
import { useCallback, useEffect, useState } from "react"

export default function JobsTable() {
  const queryClient = useQueryClient()
  const query = useQuery(jobsQueryOptions())
  const [currentHoveredJobId, setCurrentHoveredJobId] = useState(null as null | string)
  const [debouncedHoveredJobId] = useDebouncedValue(currentHoveredJobId, { wait: 100 })

  const prefetchJobDrawer = useCallback(async (jobId: Types.JobType["id"]) => {
    await queryClient.ensureQueryData(jobDrawerQueryOptions(jobId))
  }, [])

  useEffect(() => {
    if (debouncedHoveredJobId) {
      prefetchJobDrawer(debouncedHoveredJobId)
    }
  }, [debouncedHoveredJobId])

  // Debounce rapid mouse overs on the same job
  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLTableRowElement>) => {
    const jobId = event.currentTarget.id
    setCurrentHoveredJobId(jobId)
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
      onMouseOver={handleMouseEnter}
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
