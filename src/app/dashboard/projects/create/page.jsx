"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";

export default function CreateProjectPage() {
  const router = useRouter();
  const cookie = new Cookies();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [userRole, setUserRole] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const role = cookie.get("mock_role") || "admin";
    setUserRole(role);
    setIsMounted(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      alert("Project created successfully (Mock Mode)!");
      setSubmitting(false);
      router.push("/dashboard/projects");
    }, 800);
  };

  if (!isMounted) return <div className="p-4 text-slate-500 animate-pulse">Loading form...</div>;

  const canCreateProject = userRole === "admin" || userRole === "editor";

  if (!canCreateProject) {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-4" dir="ltr">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto shadow-sm">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Denied</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          As a <span className="font-semibold text-indigo-600 uppercase">{userRole}</span>, you do not have permission to create new projects. Please contact your administrator.
        </p>
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
        >
          Return to Projects List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left" dir="ltr">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
        <p className="text-sm text-slate-500 mt-1">Initialize a core blueprint for tracking team achievements.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition text-sm"
            placeholder="e.g., Orbit E-Commerce Store"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows="4"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 transition text-sm"
            placeholder="Provide core scope and architectural details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Project Status</label>
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 transition text-sm cursor-pointer"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Save Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
