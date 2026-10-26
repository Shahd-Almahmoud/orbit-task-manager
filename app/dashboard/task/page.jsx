"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { deleteReq, getReq } from "@/lib/api";

const PAGE_SIZE = 10;

export default function TaskListPage() {
  const { isAuthenticated, user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [page, setPage] = useState(1);

  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const userRole = user?.role || "developer";
  const canCreateTask = userRole === "admin" || userRole === "editor";
  const canEditTask = canCreateTask;
  const canDeleteTask = userRole === "admin";

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // 1. Fetch the projects
        try {
          const projectsList = await getReq("/projects");
          setProjects(Array.isArray(projectsList) ? projectsList : []);
        } catch (err) {
          console.error("Error fetching projects:", err);
        }

        // 2. Fetch the tasks
        const tasksList = await getReq("/tasks");
        setTasks(Array.isArray(tasksList) ? tasksList : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    setDeletingTaskId(taskId);
    setError("");

    try {
      await deleteReq(`/tasks/${taskId}`);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    } finally {
      setDeletingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchProject = filterProject ? task.project_id == filterProject : true;
    const matchStatus = filterStatus ? task.status === filterStatus : true;
    const matchPriority = filterPriority ? task.priority === filterPriority : true;
    return matchProject && matchStatus && matchPriority;
  });

  //calculate total pages and visible tasks for pagination
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const visibleTasks = filteredTasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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
            onChange={(e) => {
              setFilterProject(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setFilterPriority(e.target.value);
              setPage(1);
            }}
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
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
                <th className="p-4 text-center">Title</th>
                <th className="p-4 text-center">Project</th>
                <th className="p-4 text-center">Priority</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Due Date</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredTasks.length > 0 ? (
                visibleTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  const projectName = project ? project.name : `Project #${task.project_id}`;
                  
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 text-center font-semibold text-slate-900">{task.title}</td>
                      <td className="p-4 text-center text-slate-500">{projectName}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                          task.priority === "high" ? "bg-rose-50 text-rose-700" : 
                          task.priority === "medium" ? "bg-amber-50 text-amber-700" : 
                          "bg-sky-50 text-sky-700"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="capitalize font-medium text-slate-600">
                          {task.status?.replace('_', ' ') || "Unknown"}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-500">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-3">
                          {canEditTask && (
                            <Link
                              href={`/dashboard/task/${task.id}?edit=1`}
                              className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </Link>
                          )}
                          {canDeleteTask && (
                            <button
                              type="button"
                              onClick={() => handleDelete(task.id)}
                              disabled={deletingTaskId === task.id}
                              className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                            >
                              {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                          </div>
                          <Link
                            href={`/dashboard/task/${task.id}`}
                            className="whitespace-nowrap rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                          >
                            View Details →
                          </Link>
                        </div>
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
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 p-4">
          <span className="inline-flex items-center text-sm text-slate-600">
            Page {page}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Previous Page
            </button>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}