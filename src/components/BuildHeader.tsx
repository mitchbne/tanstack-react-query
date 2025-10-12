import StateIndicator from "./StateIndicator"
import { useBuild } from "../lib/useBuild"
import TanStackObservable from "./TanStackObservable"

export default function BuildHeader() {
  const { build, buildFetching } = useBuild()

  return (
    <div className="h-16 border-b flex items-center gap-2 relative border-gray-200 px-2 w-full mr-auto">
      <h1 className="font-bold text-xl">Build #{build.number}</h1>
      <StateIndicator state={build.state} />
      <div className="w-32 relative h-full">
        <TanStackObservable isFetching={buildFetching} name={`Build #${build.number}`} />
      </div>
    </div>
  )
}
