import Drawer from "./components/Drawer"
import Sidebar from "./components/Sidebar"
import Jobs from "./components/Jobs"
import UtilitySidebar from "./components/UtilitySidebar"

export default function App() {
  return (
    <div className="flex flex-row divide-x divide-gray-300 h-screen">
      <Sidebar />
      <div className="flex flex-col h-full flex-1 w-full">
        <div className="flex-1 max-h-screen overflow-y-auto">
          <Jobs />
        </div>
        <Drawer />
      </div>
      <UtilitySidebar />
    </div>
  )
}
