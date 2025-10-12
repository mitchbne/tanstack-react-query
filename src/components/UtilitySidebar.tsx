import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import useCurrentJobOrStep from "../lib/useCurrentStepOrJob"
import formatTime from "../util/formatTime"
import { useBuild } from "../lib/useBuild"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import { useCallback, useRef } from "react"
import * as Types from "../lib/types"

export default function UtilitySidebar() {
  const { events, simulateRunningBuild, setSimulateRunningBuild } = useBuild()
  const { currentStepId, currentJobId } = useCurrentJobOrStep()

  return (
    <aside className="w-md flex flex-col h-full max-h-[calc(100vh-4rem)] bg-gray-50" aria-label="Utility sidebar">
      <div className="flex-1 p-2">
        <h2 className="text-lg font-medium">About</h2>
        <p className="mt-2 text-sm text-gray-600">
          This is a demo application showcasing the use of <code>@tanstack/react-query</code> for data fetching and state management in
          React. It simulates fetching a list of steps and their individual states, with automatic refetching when step data becomes stale
          as a build is running.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Each step randomly changes its state between "passed", "failed", and "running" each that time it is fetched.
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between py-0.5">
            <label className="flex grow flex-col cursor-pointer select-none" htmlFor="simulate-build">
              <span id="simulate-build-label" className="font-medium text-sm/6 text-black">
                Simulate a running build
              </span>
              <span id="simulate-build-description" className="text-sm text-gray-400">
                Mock a build that is continuously updating its steps
              </span>
            </label>
            <div className="group relative inline-flex h-5 w-10 shrink-0 items-center justify-center rounded-full outline-offset-2 outline-blue-500 has-focus-visible:outline-2">
              <span className="absolute mx-auto h-4 w-9 rounded-full bg-gray-800/50 inset-ring inset-ring-white/10 transition-colors duration-200 ease-in-out group-has-checked:bg-blue-500" />
              <span className="absolute left-0 size-5 rounded-full border border-gray-300 bg-white transition-transform duration-200 ease-in-out group-has-checked:translate-x-5" />
              <input
                id="simulate-build"
                type="checkbox"
                onChange={(e) => setSimulateRunningBuild(e.target.checked)}
                role="switch"
                aria-checked={Boolean(simulateRunningBuild)}
                aria-labelledby="simulate-build-label"
                aria-describedby="simulate-build-description"
                className="absolute inset-0 appearance-none cursor-pointer focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 border-t border-gray-200 mt-4">
        <div className="flex items-center justify-between py-0.5 px-2">
          <span className="flex grow flex-col font-medium text-sm/6 text-black">Current step ID</span>
          <span className="text-gray-400 font-mono text-xs">{currentStepId ?? "None"}</span>
        </div>

        <div className="flex items-center justify-between py-0.5 px-2">
          <span className="flex grow flex-col font-medium text-sm/6 text-black">Current job ID</span>
          <span className="text-gray-400 font-mono text-xs">{currentJobId ?? "None"}</span>
        </div>

        <EventsList events={events} />
      </div>
    </aside>
  )
}

function EventsList({ events }: { events: Types.EventType[] }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Auto-scroll to top when opening the disclosure
  const handleClick = useCallback((disclosureOpen: boolean) => {
    if (disclosureOpen) {
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  return (
    <div>
      <Disclosure>
        {({ open }) => (
          <>
            <DisclosureButton
              ref={buttonRef}
              className="flex flex-row items-center justify-between w-full py-0.5 px-2 cursor-pointer select-none"
              onMouseDown={() => handleClick(!open)}
            >
              <p className="text-sm/6 font-medium">Events timeline</p>
              <div className="flex items-center gap-x-2">
                {events.length > 0 && <span className="text-xs text-gray-400">{events.length} events</span>}
                <ChevronDownIcon className={clsx("w-4 h-4 transition-transform duration-150 ease-in", { "-rotate-90": !open })} />
              </div>
            </DisclosureButton>
            <DisclosurePanel
              as="ul"
              className={clsx("divide-y divide-gray-200 px-2", {
                "border-t border-gray-200 h-80 overflow-y-scroll": events.length > 0,
                "pb-2": events.length === 0,
              })}
              ref={listRef}
            >
              {events.length === 0 && <li className="text-xs text-gray-400 py-1">No events yet</li>}
              {events.map((event, index) => (
                <li key={index} className="text-xs text-gray-600 py-1 font-mono grid grid-cols-[auto_1fr] gap-2">
                  <div>{formatTime(event.timestamp)}</div>
                  <pre>{event.message}</pre>
                </li>
              ))}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
