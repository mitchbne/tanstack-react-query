import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import useQueryParams from "../lib/useQueryParams"
import * as Types from "../lib/types"
import { jobDrawerQueryOptions } from "../util/jobs"
import { stepDrawerQueryOptions } from "../util/steps"
import { useCallback, useEffect, useMemo, type PropsWithChildren } from "react"
import { Navigate, useSearchParams } from "react-router"
import TanStackObservable from "./TanStackObservable"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

export default function DrawerWrapper() {
  const params = useQueryParams()

  const jobsDrawerQuery = useQuery(
    jobDrawerQueryOptions(params.jobUuid as string, {
      enabled: Boolean(params.jobUuid),
    }),
  )

  const stepDrawerQuery = useQuery(
    stepDrawerQueryOptions(params.stepUuid as string, {
      enabled: Boolean(params.stepUuid),
    }),
  )

  const [, setSearchParams] = useSearchParams()
  const handleDrawerClose = useCallback(() => {
    setSearchParams((currentParams) => {
      currentParams.delete("sid")
      currentParams.delete("jid")
      currentParams.delete("open")
      return currentParams
    })
  }, [setSearchParams])

  // Don't render the drawer if we don't have a job or step uuid in the URL.
  if (!params.jobUuid && !params.stepUuid) {
    return null
  }

  if (params.stepUuid) {
    return <StepDrawer handleDrawerClose={handleDrawerClose} stepDrawerQuery={stepDrawerQuery} />
  }

  if (params.jobUuid) {
    return <JobDrawer handleDrawerClose={handleDrawerClose} currentJobUuid={params.jobUuid} jobsDrawerQuery={jobsDrawerQuery} />
  }

  return null
}

function StepDrawer({
  stepDrawerQuery,
  handleDrawerClose,
}: React.PropsWithChildren<{ stepDrawerQuery: UseQueryResult<Types.StepDrawerReturnType>; handleDrawerClose: () => void }>) {
  useEffect(() => {
    if (!stepDrawerQuery.data && !stepDrawerQuery.isLoading) {
      handleDrawerClose()
    }
  }, [stepDrawerQuery.data, stepDrawerQuery.isLoading, handleDrawerClose])

  const currentJob = useMemo(() => {
    if (!stepDrawerQuery.data) return null
    return stepDrawerQuery.data.jobs[stepDrawerQuery.data.jobs.length - 1] || null
  }, [stepDrawerQuery.data])

  if (!stepDrawerQuery.data && !stepDrawerQuery.isLoading) {
    return null
  }

  if (!stepDrawerQuery.data || stepDrawerQuery.isLoading) {
    return <div className="h-128 sticky flex flex-col bottom-0 left-0 z-10 bg-white right-0 border-t border-gray-200 p-2">Loading...</div>
  }

  if (!currentJob) {
    return null
  }

  return (
    <Drawer handleDrawerClose={handleDrawerClose} heading={`Details for ${stepDrawerQuery.data.step.name}`}>
      <TanStackObservable
        isFetching={stepDrawerQuery.isFetching}
        name={`Step drawer for ${stepDrawerQuery.data.step.name}`}
        position="top-right"
      />

      <RetriesNavigation
        jobs={stepDrawerQuery.data.jobs}
        currentJobId={stepDrawerQuery.data.jobs[stepDrawerQuery.data.jobs.length - 1]?.id}
      />
      <p className="font-medium">{currentJob.name}</p>
      <p className="text-sm text-gray-600">Step UUID: {currentJob.step_uuid}</p>
      <p className="text-sm text-gray-600">State: {currentJob.state}</p>
      <p className="text-sm text-gray-600">Retried in: {currentJob.jobRetriedIn || "N/A"}</p>
    </Drawer>
  )
}

function RetriesNavigation({ jobs, currentJobId }: { jobs?: Types.JobType[]; currentJobId?: string }) {
  const [, setSearchParams] = useSearchParams()

  const { previousJob, nextJob, currentJob } = useMemo(() => {
    if (!jobs || !currentJobId) {
      return { previousJob: null, nextJob: null, currentJob: null }
    }

    const currentIndex = jobs.findIndex((job) => job.id === currentJobId)
    const previousJob = jobs[currentIndex - 1] || null
    const nextJob = jobs[currentIndex + 1] || null
    return { previousJob, nextJob, currentJob: jobs[currentIndex] || null }
  }, [jobs, currentJobId])

  if (!jobs || !currentJobId || !currentJob) {
    return null
  }

  return (
    <div className="flex items-center self-end space-x-2">
      <p className="text-sm text-gray-600">
        Retry {jobs.findIndex((job) => job.id === currentJob.id) + 1} of {jobs.length}
      </p>
      <button
        className="bg-gray-100 not-disabled:hover:bg-gray-200 text-gray-600 h-7 w-7 inline-flex items-center justify-center rounded-md disabled:opacity-50"
        disabled={!previousJob}
        onClick={() => {
          if (!previousJob) return
          setSearchParams((currentParams) => {
            currentParams.set("jid", previousJob.id)
            currentParams.delete("sid")
            return currentParams
          })
        }}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        className="bg-gray-100 not-disabled:hover:bg-gray-200 text-gray-600 h-7 w-7 inline-flex items-center justify-center rounded-md disabled:opacity-50"
        disabled={!nextJob}
        onClick={() => {
          if (!nextJob) return
          setSearchParams((currentParams) => {
            currentParams.set("jid", nextJob.id)
            currentParams.delete("sid")
            return currentParams
          })
        }}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  )
}

function JobDrawer({
  currentJobUuid,
  jobsDrawerQuery,
  handleDrawerClose,
}: React.PropsWithChildren<{
  currentJobUuid: string
  jobsDrawerQuery: UseQueryResult<Types.JobDrawerReturnType>
  handleDrawerClose: () => void
}>) {
  useEffect(() => {
    if (!jobsDrawerQuery.data && !jobsDrawerQuery.isLoading) {
      handleDrawerClose()
    }
  }, [jobsDrawerQuery.data, jobsDrawerQuery.isLoading, handleDrawerClose])

  if (!jobsDrawerQuery.data && !jobsDrawerQuery.isLoading) {
    return null
  }

  if (!jobsDrawerQuery.data || jobsDrawerQuery.isLoading) {
    return <div className="h-128 sticky flex flex-col bottom-0 left-0 z-10 bg-white right-0 border-t border-gray-200 p-2">Loading...</div>
  }

  const currentJob = jobsDrawerQuery.data.find((job) => job.id === currentJobUuid)

  if (!currentJob) {
    // If we don't have a job with the currentJobUuid, redirect to the same page without the jid param.
    return <Navigate to={"./"} replace={true} />
  }

  return (
    <Drawer handleDrawerClose={handleDrawerClose} heading={`Details for ${currentJob.name}`}>
      <TanStackObservable isFetching={jobsDrawerQuery.isFetching} name={`Jobs drawer for ${currentJob.name}`} position="top-right" />
      <RetriesNavigation jobs={jobsDrawerQuery.data} currentJobId={currentJob.id} />
      <p className="font-medium">{currentJob.name}</p>
      <p className="text-sm text-gray-600">Step UUID: {currentJob.step_uuid}</p>
      <p className="text-sm text-gray-600">State: {currentJob.state}</p>
      <p className="text-sm text-gray-600">Retried in: {currentJob.jobRetriedIn || "N/A"}</p>
    </Drawer>
  )
}

function Drawer(props: PropsWithChildren<{ handleDrawerClose: () => void; heading: string }>) {
  return (
    <div className="h-128 sticky flex flex-col bottom-0 left-0 z-10 bg-white right-0 border-t border-gray-200">
      <div className="h-24 flex flex-col bg-white items-start justify-center border-b border-gray-200 p-2">
        <button
          onClick={props.handleDrawerClose}
          className="text-sm text-gray-600 self-end ml-auto bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 font-medium cursor-pointer"
        >
          Close drawer
        </button>
        <h2 className="font-medium text-lg">{props.heading}</h2>
        <p className="text-sm text-gray-600">This is where you would show more details about the currently selected step.</p>
      </div>
      <div className="p-2 flex-1 rounded-md max-h-104 overflow-y-auto relative flex flex-col">{props.children}</div>
    </div>
  )
}
