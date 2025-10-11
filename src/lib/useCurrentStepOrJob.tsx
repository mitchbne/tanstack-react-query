import { useEffect, useState } from "react"
import useQueryParams from "./useQueryParams"
import { jobQueryOptions } from "../util/jobs"
import * as Types from "../lib/types"
import { QueryObserver, useQueryClient } from "@tanstack/react-query"

export type UseCurrentJobOrStep = {
  currentStepId: string | null
  currentJobId: string | null
}

export default function useCurrentJobOrStep() {
  const queryClient = useQueryClient()
  const [currentStepId, setCurrentStepId] = useState<Types.StepType["id"] | null>(null)
  const [currentJobId, setCurrentJobId] = useState<Types.JobType["id"] | null>(null)
  const { stepUuid, jobUuid } = useQueryParams()

  useEffect(() => {
    if (!stepUuid && !jobUuid) {
      setCurrentStepId(null)
      setCurrentJobId(null)
      return
    }

    if (stepUuid) {
      setCurrentStepId(stepUuid)
      setCurrentJobId(null)
      return
    }

    if (jobUuid) {
      setCurrentJobId(jobUuid)

      const jobsObserver = new QueryObserver(queryClient, jobQueryOptions(jobUuid))

      // If we have can get a stepUuid from the job, use that as the current step. Otherwise, subscribe to the job and update the current step when it changes.
      const stepUuid = jobsObserver.getCurrentResult().data?.step_uuid ?? null
      if (stepUuid) {
        setCurrentStepId(stepUuid)
      } else {
        const jobsObserverUnsubscribe = jobsObserver.subscribe((result) => {
          if (result.isSuccess && result.data) {
            const stepUuid = result.data.step_uuid
            setCurrentStepId(stepUuid)
          }
        })

        return () => {
          jobsObserverUnsubscribe()
        }
      }
    }
  }, [stepUuid, jobUuid, queryClient])

  return {
    currentStepId,
    currentJobId,
  }
}
