"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CreateTaskPage() {
  const router = useRouter();
  const { getAuthHeaders, isAuthenticated, user } = useAuth();

  const userRole = user?.role || "developer";

  // ✅ رابط الـ API الموحد
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (userRole === "developer") {
      router.push("/dashboard");
    }
  }, [userRole]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedDevs, setSelectedDevs] = useState([]);

  const [isMounted, setIsMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    const fetchRequiredData = async () => {
      if (isAuthenticated && getAuthHeaders) {
        try {
          setLoading(true);
          setError("");
          
          const projRes = await fetch(`${API_URL}/projects`, { 
            headers: getAuthHeaders() 
          });
          
          if (projRes.ok) {
            const projData = await projRes.json();
            setProjects(Array.isArray(projData) ? projData : projData.data || []);
          } else {
            console.error("Failed to fetch projects:", projRes.status);
          }

          const devRes = await fetch(`${API_URL}/users`, { 
            headers: getAuthHeaders() 
          });
          
          if (devRes.ok) {
            const devData = await devRes.json();
            const usersList = Array.isArray(devData) ? devData : devData.data || [];
            setDevelopers(usersList.filter(u => u.role === "developer"));
          }
        } catch (err) {
          console.error("Error loading dropdown data:", err);
          setError("Network error. Please check your connection.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchRequiredData();
  }, [isAuthenticated, getAuthHeaders]);

  const handleDevCheckboxChange = (devId) => {
    if (selectedDevs.includes(devId)) {
      setSelectedDevs(selectedDevs.filter((id) => id !== devId));
    } else {
      setSelectedDevs([...selectedDevs, devId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      setError("Session missing. Please log in.");
      setSubmitting(false);
      return;
    }

    if (!projectId) {
      setError("Please select a project.");
      setSubmitting(false);
      return;
    }

    try {
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : null;

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          description: description || null,
          project_id: parseInt(projectId),
          status,
          priority,
          due_date: formattedDueDate,
          assigned_users: selectedDevs.length > 0 ? selectedDevs.map(id => parseInt(id)) : null
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response received from server.");
      }

      const result = await response.json();

      if (response.status === 201) {
        setSuccess(result.message || "Task created successfully!");
        setTimeout(() => {
          router.push("/dashboard/task");
        }, 1500);
      } else if (response.status === 422) {
        const errors = result.errors || {};
        const errorMessages = Object.values(errors).flat().join(", ");
        setError(errorMessages || result.message || "Validation error.");
      } else {
        setError(result.message || result.error || "Failed to create task.");
      }
    } catch (err) {
      console.error("Task Creation Error:", err);
      setError(err.message || "Network error. Make sure backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  if (userRole === "developer") {
    return null;
  }

  if (!isMounted || loading) {
    return <div className="p-4 text-slate-500">Loading form configurations...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left" dir="ltr">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create New Task</h2>
        <p className="text-sm text-slate-500 mt-1">Assign deliverables and architectural milestones to developers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 text-sm font-semibold rounded-xl border border-rose-100 flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-xl border border-emerald-100 flex items-center gap-2">
            <i className="fa-solid fa-check-circle"></i>
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title*</label>
          <input type="text" required maxLength={255} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition text-sm" placeholder="e.g., Secure Sanctum Routes" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Associated Project*</label>
          <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition text-sm cursor-pointer" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">-- Select a project from database --</option>
            {projects.length > 0 ? (
              projects.map((proj) => (
                <option key={proj.id} value={proj.id}>#{proj.id} - {proj.name}</option>
              ))
            ) : (
              <option value="" disabled>No projects available</option>
            )}
          </select>
          {projects.length === 0 && !error && (
            <p className="text-xs text-amber-600 mt-1"> No projects found. Please create a project first.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition text-sm cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition text-sm cursor-pointer" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
          <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition text-sm" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Assign Developers (Optional)</label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto space-y-2">
            {developers.length > 0 ? (
              developers.map((dev) => (
                <label key={dev.id} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                  <input type="checkbox" checked={selectedDevs.includes(dev.id)} onChange={() => handleDevCheckboxChange(dev.id)} className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                  <span>{dev.name} <span className="text-xs text-slate-400">({dev.email})</span></span>
                </label>
              ))
            ) : (
              <p className="text-xs text-slate-400 p-1">No developers available.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Task Scope & Description</label>
          <textarea rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition text-sm" placeholder="Outline task specs and expectations..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={() => router.push("/dashboard/task")} className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
          <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50">{submitting ? "Creating..." : "Save Task"}</button>
        </div>
      </form>
    </div>
  );
}