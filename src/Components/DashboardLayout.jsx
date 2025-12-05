import { Outlet } from "react-router-dom";
import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <div className="h-screen w-screen bg-gray-50 text-gray-900 flex flex-col">
      <Topbar onMenuClick={openSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop static, mobile drawer) */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
