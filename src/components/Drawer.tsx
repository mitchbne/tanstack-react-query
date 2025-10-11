import { useQuery } from "@tanstack/react-query"
import useQueryParams from "../lib/useQueryParams"
import * as Types from "../lib/types"
import { jobQueryOptions } from "../util/jobs"
import { stepQueryOptions } from "../util/steps"
import { useCallback } from "react"
import { useSearchParams } from "react-router"

export default function DrawerWrapper() {
  const params = useQueryParams()

  const { data: job } = useQuery(
    jobQueryOptions(params.jobUuid as string, {
      enabled: Boolean(params.jobUuid),
    }),
  )

  const { data: step } = useQuery(
    stepQueryOptions(params.stepUuid as string, {
      enabled: Boolean(params.stepUuid),
    }),
  )

  // Don't render the drawer if we don't have a job or step uuid in the URL.
  if (!params.jobUuid && !params.stepUuid) {
    return null
  }

  if (step) {
    return <StepDrawer step={step} />
  }

  if (job) {
    return <JobDrawer job={job} />
  }

  return null
}

function StepDrawer({ step }: React.PropsWithChildren<{ step: Types.StepType }>) {
  return <Drawer heading={`Details for ${step.name}`} />
}

function JobDrawer({ job }: React.PropsWithChildren<{ job: Types.JobType }>) {
  return <Drawer heading={`Details for ${job.name}`} />
}

function Drawer({ heading }: { heading: string }) {
  const [, setSearchParams] = useSearchParams()
  const handleDrawerClose = useCallback(() => {
    setSearchParams((currentParams) => {
      currentParams.delete("sid")
      currentParams.delete("jid")
      currentParams.delete("open")
      return currentParams
    })
  }, [setSearchParams])

  return (
    <div className="h-128 sticky flex flex-col bottom-0 left-0 z-10 bg-white right-0 border-t border-gray-200 p-2">
      <button
        onClick={handleDrawerClose}
        className="text-sm text-gray-600 self-end ml-auto bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 font-medium cursor-pointer"
      >
        Close drawer
      </button>
      <h2 className="font-medium text-lg">{heading}</h2>
      <p className="text-sm text-gray-600">This is where you would show more details about the currently selected step.</p>
    </div>
  )
}
