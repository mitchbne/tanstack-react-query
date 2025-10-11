import type { UseQueryResult } from "@tanstack/react-query"

type TanStackObservableProps = React.PropsWithChildren &
  Partial<UseQueryResult> & {
    name: string
  }

export default function TanStackObservable(props: TanStackObservableProps) {
  return (
    props.isFetching && (
      <div className="absolute right-0.5 bottom-0.5 bg-blue-50 px-0.5 z-10 rounded border border-blue-300 text-blue-600 text-xs/4 font-medium">
        {<p>Fetching {props.name}...</p>}
      </div>
    )
  )
}
