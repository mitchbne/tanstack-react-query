import { useSearchParams } from "react-router"

type BuildSearchParams = {
  stepUuid: string | null
  jobUuid: string | null
  open: string | null
}

export default function useQueryParams(): BuildSearchParams {
  const [searchParams] = useSearchParams()

  return {
    stepUuid: searchParams.get("sid") ?? null,
    jobUuid: searchParams.get("jid") ?? null,
    open: searchParams.get("open") ?? null,
  }
}
