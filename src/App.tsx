import Drawer from "./components/Drawer"
import Sidebar from "./components/Sidebar"
import UtilitySidebar from "./components/UtilitySidebar"
import BuildHeader from "./components/BuildHeader"
import JobsTable from "./components/JobsTable"

export default function App() {
  return (
    <div className="flex flex-col h-screen">
      <BuildHeader />
      <div className="flex-1 flex flex-row divide-x divide-gray-300 h-full">
        <Sidebar />
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] flex-1 w-full">
          <div className="flex-1 overflow-y-auto">
            <JobsTable />
          </div>
          <Drawer />
        </div>
        <UtilitySidebar />
      </div>
    </div>
  )
}
