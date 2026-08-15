import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full" dir="ltr">
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 w-full items-stretch">
        <aside className="w-full lg:w-64 bg-white border-r border-slate-200/60 flex-shrink-0 min-h-fit lg:min-h-[calc(100vh-65px)]">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[75vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
