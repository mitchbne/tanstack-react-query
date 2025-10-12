import { useQuery } from "@tanstack/react-query"
import { jobsQueryOptions } from "../util/jobs"
import { jobQueryOptions } from "../util/jobs"
import StateIndicator from "./StateIndicator"
import TanStackObservable from "./TanStackObservable"
import { useNavigate } from "react-router"
import * as Types from "../lib/types"

export default function Jobs() {
  const query = useQuery(jobsQueryOptions())

  return (
    <div className="w-full flex-1 ">
      <table className="w-full divide-y divide-gray-300 text-sm text-gray-600">
        <tbody>
          {query.data?.map((job) => (
            <Job key={job.id} job={job} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Job({ job }: { job: Types.JobType }) {
  const navigate = useNavigate()
  const query = useQuery(jobQueryOptions(job.id, { initialData: job }))

  if (!query.data) {
    return null
  }

  return (
    <tr
      className="border-b w-full border-gray-200 last-of-type:border-b-0 relative"
      onClick={() => {
        navigate(`?jid=${job.id}`)
      }}
    >
      <td className="p-2 font-medium">{query.data.name}</td>
      <td className="p-2 font-mono">{query.data.step_uuid}</td>
      <td className="p-2">
        <StateIndicator state={query.data.state} />
      </td>
      <td className="p-2 text-right relative w-48">
        <TanStackObservable isFetching={query.isFetching} name={job.name} />
      </td>
    </tr>
  )
}
