import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      <Navbar />

      <div className="flex">
        
        <Sidebar />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AppLayout;