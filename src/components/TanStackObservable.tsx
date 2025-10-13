import { clsx } from "clsx"

type TanStackObservableProps = React.PropsWithChildren & {
  isFetching: boolean
  name: string
  position?: "bottom-right" | "top-right"
}

export default function TanStackObservable(props: TanStackObservableProps) {
  const { position = "bottom-right" } = props

  return (
    props.isFetching && (
      <div
        className={clsx("absolute bg-blue-50 px-0.5 z-10 rounded border border-blue-300 text-blue-600 text-xs/4 font-medium", {
          "bottom-0.5 right-0.5": position === "bottom-right",
          "top-0.5 right-0.5": position === "top-right",
        })}
      >
        {<p>Fetching {props.name}...</p>}
      </div>
    )
  )
}
