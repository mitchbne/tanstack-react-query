import { useEffect, useState } from "react"
import useQueryParams from "./useQueryParams"
import { jobQueryKey } from "../util/jobs"
import * as Types from "../lib/types"
import { useQueryClient } from "@tanstack/react-query"

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

      // This is mainly to keep TypeScript happy; queryClient should always be defined inside a QueryClientProvider.
      if (!queryClient) {
        return
      }

      const stepUuid = queryClient.getQueryCache().find<Types.JobType>({ queryKey: jobQueryKey(jobUuid) })?.state.data?.step_uuid ?? null

      if (stepUuid) {
        setCurrentStepId(stepUuid)
      } else {
        queryClient.getQueryCache().subscribe((event) => {
          if (
            (event.type === "added" || event.type === "updated") &&
            event.query.queryKey.length == 2 &&
            event.query.queryKey[0] === "jobs" &&
            event.query.queryKey[1] === jobUuid
          ) {
            const job = event.query.state.data as Types.JobType | undefined
            if (!job) return

            const stepUuid = job.step_uuid
            setCurrentStepId(stepUuid)
          }
        })
      }
    }
  }, [stepUuid, jobUuid, queryClient])

  return {
    currentStepId,
    currentJobId,
  }
}
