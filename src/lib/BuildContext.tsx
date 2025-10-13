import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from "react"
import * as Types from "./types"
import { BuildContext } from "./useBuild"
import generateEvent from "../util/generateEvent"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { buildQueryOptions } from "../util/build"
import { useAsyncQueuer } from "@tanstack/react-pacer"

type StepsMap = Record<Types.StepType["id"], Set<Types.JobType["id"]>>

export default function BuildContextProvider(props: PropsWithChildren<{ build: Types.BuildType }>) {
  const queryClient = useQueryClient()
  const stepJobsMap = useRef<StepsMap>({})
  const [simulateRunningBuild, setSimulateRunningBuild] = useState<boolean | null>(null)
  const [events, setEvents] = useState<Types.EventType[]>([])

  const buildQuery = useQuery(buildQueryOptions(props.build.id, { initialData: props.build }))

  const refetchBuildQueue = useAsyncQueuer<Types.EventType, void>(
    async () => {
      // If the query is already fetching, this will dedupe; we still await settlement
      await buildQuery.refetch()
    },
    {
      concurrency: 1, // Ensure strictly sequential processing
      maxSize: 1, // Keep at most ONE pending item; extras are rejected
      started: true, // Start immediately when the first item arrives
      wait: 0, // Optional: Amount of time to wait before processing the next item
    },
  )

  // Create stepJobs map whenever a ["jobs", job.id] is added
  useEffect(() => {
    queryClient.getQueryCache().subscribe((event) => {
      if (
        (event.type === "added" || event.type === "updated") &&
        event.query.queryKey.length == 2 &&
        event.query.queryKey[0] === "jobs" &&
        Boolean(event.query.queryKey[1])
      ) {
        const job = event.query.state.data as Types.JobType | undefined
        if (!job) return

        const newStepJobsMap = { ...stepJobsMap.current }
        const jobsForStepSet = newStepJobsMap[job.step_uuid] ?? new Set<Types.JobType["id"]>()
        jobsForStepSet.add(event.query.queryKey[1] as Types.JobType["id"])
        newStepJobsMap[job.step_uuid] = jobsForStepSet
        stepJobsMap.current = newStepJobsMap
      }
    })
  }, [queryClient])

  const simulateStepUpdate = useCallback(() => {
    const event = generateEvent()
    setEvents((events) => [event, ...events])
    console.log(new Date().toISOString() + " New build event", event)

    // console.log("The following steps have been updated:", event.step_uuids.join(", "))
    refetchBuildQueue.addItem(event)

    // console.log("Invalidated steps:", event.step_uuids.join(", "))
    // For each step_uuids in the event, refetch that step
    event.step_uuids.forEach((step_id) => {
      queryClient.invalidateQueries({ queryKey: ["steps", step_id], exact: true })
      queryClient.invalidateQueries({ queryKey: ["steps", step_id, "step-jobs"], exact: true })

      stepJobsMap.current[step_id]?.forEach((job_id) => {
        queryClient.invalidateQueries({ queryKey: ["jobs", job_id] })
        queryClient.invalidateQueries({ queryKey: ["jobs", job_id, "job-drawer"], exact: true })
      })
    })
  }, [])

  // Create build change events
  useEffect(() => {
    // We haven't started simulating a running build yet
    if (simulateRunningBuild === null) {
      return
    }

    // We've stopped simulating a running build
    if (!simulateRunningBuild) {
      const event: Types.EventType = {
        id: crypto.randomUUID(),
        type: "simulation:stopped",
        step_uuids: [],
        message: "Build simulation stopped",
        timestamp: new Date(),
      }
      setEvents((events) => [event, ...events])
      return
    }

    console.log("Simulating a running build...")
    const event: Types.EventType = {
      id: crypto.randomUUID(),
      type: "simulation:started",
      step_uuids: [],
      message: "Build simulation started",
      timestamp: new Date(),
    }
    setEvents((events) => [event, ...events])

    simulateStepUpdate()
    const interval = setInterval(() => {
      simulateStepUpdate()
    }, 600)

    return () => clearInterval(interval)
  }, [simulateRunningBuild, simulateStepUpdate])

  return (
    <BuildContext.Provider
      value={{
        build: buildQuery.data ?? props.build,
        buildFetching: buildQuery.isFetching,
        simulateRunningBuild: Boolean(simulateRunningBuild),
        setSimulateRunningBuild,
        events,
      }}
    >
      {props.children}
    </BuildContext.Provider>
  )
}
