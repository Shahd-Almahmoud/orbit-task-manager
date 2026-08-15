"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "universal-cookie";

export default function TaskListPage() {
  const cookie = new Cookies();

  // Hydration Error
  const [userRole, setUserRole] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  useEffect(() => {
    const role = cookie.get("mock_role") || "admin";
    setUserRole(role);
    setIsMounted(true);
  }, []);

  const [projects] = useState([
    { id: 1, name: "Orbit Website Redesign" },
    { id: 2, name: "Laravel Core API" },
    { id: 3, name: "Flutter Mobile App" },
  ]);

  const [tasks] = useState([
    {
      id: 1,
      title: "Design Database Schema",
      project_id: 2,
      projectName: "Laravel Core API",
      priority: "high",
      status: "done",
      due_date: "2026-08-20",
    },
    {
      id: 2,
      title: "Integrate Laravel Sanctum Auth",
      project_id: 2,
      projectName: "Laravel Core API",
      priority: "high",
      status: "in_progress",
      due_date: "2026-08-25",
    },
    {
      id: 3,
      title: "Create Next.js Sidebar Component",
      project_id: 1,
      projectName: "Orbit Website Redesign",
      priority: "medium",
      status: "review",
      due_date: "2026-08-28",
    },
    {
      id: 4,
      title: "Fix Multi-Select Dropdown Bug",
      project_id: 1,
      projectName: "Orbit Website Redesign",
      priority: "low",
      status: "todo",
      due_date: "2026-09-02",
    },
    {
      id: 5,
      title: "Build Flutter Dashboard UI",
      project_id: 3,
      projectName: "Flutter Mobile App",
      priority: "high",
      status: "todo",
      due_date: "2026-09-10",
    },
  ]);

  // (Hydration Lock)
  if (!isMounted)
    return <div className="p-4 text-slate-500">Loading Tasks...</div>;

  const filteredTasks = tasks.filter((task) => {
    const matchProject = filterProject
      ? task.project_id == filterProject
      : true;
    const matchStatus = filterStatus ? task.status === filterStatus : true;
    const matchPriority = filterPriority
      ? task.priority === filterPriority
      : true;
    return matchProject && matchStatus && matchPriority;
  });

  const canCreateTask = userRole === "admin" || userRole === "editor";

  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Tasks Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            View, filter, and track team assignments.
          </p>
        </div>

        {canCreateTask && (
          <Link
            href="/dashboard/task/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <i className="fa-solid fa-plus"></i> Create Task
          </Link>
        )}
      </div>
      {/* filtter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Project
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* show tasks */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
                <th className="p-4">Title</th>
                <th className="p-4">Project</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-semibold text-slate-900">
                      {task.title}
                    </td>
                    <td className="p-4 text-slate-500">{task.projectName}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-md ${task.priority === "high" ? "bg-rose-50 text-rose-700" : task.priority === "medium" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-medium text-slate-600">
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{task.due_date}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/task/${task.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-slate-400 py-6">
                    No tasks match your selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
