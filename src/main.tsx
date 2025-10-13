import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { RouterProvider } from "react-router/dom"
import App from "./App"
import { createBrowserRouter } from "react-router"
import BuildContextProvider from "./lib/BuildContext"
import "./tailwind.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity },
  },
})

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
])

const build = {
  id: "build-1",
  name: "Build #42",
  number: 42,
  state: "scheduled" as const,
  started_at: new Date(),
  finished_at: null,
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BuildContextProvider build={build}>
        <RouterProvider router={router} />
        <ReactQueryDevtools client={queryClient} buttonPosition="bottom-left" />
      </BuildContextProvider>
    </QueryClientProvider>
  </StrictMode>,
)
