"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "universal-cookie";

export default function DashboardPage() {
  const cookie = new Cookies();
  const [userRole, setUserRole] = useState(""); 
  const [isMounted, setIsMounted] = useState(false);

  const [stats, setStats] = useState({
    total_projects: 5,
    total_tasks: 24,
    tasks_by_status: { todo: 6, in_progress: 10, review: 4, done: 4 },
    tasks_by_priority: { high: 5, medium: 12, low: 7 },
    recent_tasks: [
      { id: 1, title: "Design Database Schema", priority: "high", status: "done", due_date: "2026-08-20" },
      { id: 2, title: "Integrate Laravel Sanctum Auth", priority: "high", status: "in_progress", due_date: "2026-08-25" },
      { id: 3, title: "Create Next.js Sidebar Component", priority: "medium", status: "review", due_date: "2026-08-28" }
    ]
  });

  useEffect(() => {
    const role = cookie.get("mock_role") || "admin";
    setUserRole(role);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!userRole) return;
    if (userRole === "developer") {
      setStats({
        total_projects: 2,
        total_tasks: 3,
        tasks_by_status: { todo: 1, in_progress: 1, review: 1, done: 0 },
        tasks_by_priority: { high: 1, medium: 1, low: 1 },
        recent_tasks: [
          { id: 2, title: "Integrate Laravel Sanctum Auth", priority: "high", status: "in_progress", due_date: "2026-08-25" },
          { id: 3, title: "Create Next.js Sidebar Component", priority: "medium", status: "review", due_date: "2026-08-28" }
        ]
      });
    } else {
      setStats({
        total_projects: 5,
        total_tasks: 24,
        tasks_by_status: { todo: 6, in_progress: 10, review: 4, done: 4 },
        tasks_by_priority: { high: 5, medium: 12, low: 7 },
        recent_tasks: [
          { id: 1, title: "Design Database Schema", priority: "high", status: "done", due_date: "2026-08-20" },
          { id: 2, title: "Integrate Laravel Sanctum Auth", priority: "high", status: "in_progress", due_date: "2026-08-25" },
          { id: 3, title: "Create Next.js Sidebar Component", priority: "medium", status: "review", due_date: "2026-08-28" }
        ]
      });
    }
  }, [userRole]);

  if (!isMounted) return <div className="p-4 text-slate-500">Loading Dashboard...</div>;

  const showQuickActions = userRole === "admin" || userRole === "editor";

  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time task and project management statistics.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 uppercase">Current View: {userRole}</span>
      </div>

      {showQuickActions && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/projects/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">
              <i className="fa-solid fa-folder-plus"></i> Create New Project
            </Link>
            <Link href="/dashboard/task/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition">
              <i className="fa-solid fa-circle-plus"></i> Create New Task
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total_projects}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <i className="fa-solid fa-briefcase text-xl"></i>
          </div>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total_tasks}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <i className="fa-solid fa-list-check text-xl"></i>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3">Tasks by Status</h4>
          <div className="space-y-3">
            {[
              { label: "Todo", count: stats.tasks_by_status.todo, color: "bg-slate-100 text-slate-700" },
              { label: "In Progress", count: stats.tasks_by_status.in_progress, color: "bg-blue-50 text-blue-700" },
              { label: "Review", count: stats.tasks_by_status.review, color: "bg-amber-50 text-amber-700" },
              { label: "Done", count: stats.tasks_by_status.done, color: "bg-emerald-50 text-emerald-700" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3">Tasks by Priority</h4>
          <div className="space-y-3">
            {[
              { label: "High Priority", count: stats.tasks_by_priority.high, color: "bg-rose-50 text-rose-700" },
              { label: "Medium Priority", count: stats.tasks_by_priority.medium, color: "bg-amber-50 text-amber-700" },
              { label: "Low Priority", count: stats.tasks_by_priority.low, color: "bg-sky-50 text-sky-700" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-800">Recent Tasks</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
                <th className="p-4">Task Title</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {stats.recent_tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-semibold text-slate-900">{task.title}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${task.priority === 'high' ? 'bg-rose-50 text-rose-700' : task.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>{task.priority}</span>
                  </td>
                  <td className="p-4">
                    <span className="capitalize font-medium text-slate-600">{task.status.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4 text-slate-500">{task.due_date}</td>
                  <td className="p-4 text-right">
                    <Link href={`/dashboard/task/${task.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">View Details →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
