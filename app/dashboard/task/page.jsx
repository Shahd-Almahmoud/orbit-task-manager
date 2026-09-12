"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function TaskListPage() {
  const { getAuthHeaders, isAuthenticated, user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const userRole = user?.role || "developer";
  const canCreateTask = userRole === "admin" || userRole === "editor";

  // ✅ رابط الـ API الموحد عبر البروكسي
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !getAuthHeaders) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // 1. جلب المشاريع
        try {
          const projRes = await fetch(`${API_URL}/projects`, {
            headers: getAuthHeaders()
          });
          if (projRes.ok) {
            const projData = await projRes.json();
            setProjects(Array.isArray(projData) ? projData : projData.data || []);
          }
        } catch (err) {
          console.error("Error fetching projects:", err);
        }

        // 2. جلب المهام
        const tasksRes = await fetch(`${API_URL}/tasks`, {
          headers: getAuthHeaders()
        });

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          const tasksList = tasksData.data || tasksData;
          setTasks(Array.isArray(tasksList) ? tasksList : []);
        } else {
          setError("Failed to load tasks");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, getAuthHeaders]);

  const filteredTasks = tasks.filter((task) => {
    const matchProject = filterProject ? task.project_id == filterProject : true;
    const matchStatus = filterStatus ? task.status === filterStatus : true;
    const matchPriority = filterPriority ? task.priority === filterPriority : true;
    return matchProject && matchStatus && matchPriority;
  });

  if (loading) {
    return <div className="p-4 text-slate-500">Loading tasks from database...</div>;
  }

  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tasks Management</h2>
          <p className="text-sm text-slate-500 mt-1">View, filter, and track team assignments.</p>
          <p className="text-xs text-slate-400 mt-1">Total: {tasks.length} tasks | Role: {userRole}</p>
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

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Project</label>
          <select
            id="filter-project"
            name="filter-project"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
          <select
            id="filter-status"
            name="filter-status"
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
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
          <select
            id="filter-priority"
            name="filter-priority"
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
                filteredTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  const projectName = project ? project.name : `Project #${task.project_id}`;
                  
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-semibold text-slate-900">{task.title}</td>
                      <td className="p-4 text-slate-500">{projectName}</td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                          task.priority === "high" ? "bg-rose-50 text-rose-700" : 
                          task.priority === "medium" ? "bg-amber-50 text-amber-700" : 
                          "bg-sky-50 text-sky-700"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-medium text-slate-600">
                          {task.status?.replace('_', ' ') || "Unknown"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/task/${task.id}`}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-slate-400 py-10">
                    {tasks.length === 0 ? (
                      <div>
                        <p className="mb-2">No tasks found.</p>
                        {canCreateTask && (
                          <Link
                            href="/dashboard/task/create"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                          >
                            <i className="fa-solid fa-plus"></i> Create Your First Task
                          </Link>
                        )}
                      </div>
                    ) : (
                      "No tasks match your selected filters."
                    )}
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