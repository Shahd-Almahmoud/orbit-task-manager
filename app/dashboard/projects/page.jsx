"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getReq, unwrapData } from "@/lib/api";

export default function ProjectsListPage() {
  const { isAuthenticated, user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userRole = user?.role || "developer";
  const canCreateProject = userRole === "admin" || userRole === "editor";

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const projectsList = unwrapData(await getReq("/projects"));
        setProjects(Array.isArray(projectsList) ? projectsList : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to load projects.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="p-4 text-slate-500">Loading Projects...</div>;
  }

  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects Management</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor, create, and track core company projects.</p>
          <p className="text-xs text-slate-400 mt-1">Total: {projects.length} projects | Role: {userRole}</p>
        </div>
        {canCreateProject && (
          <Link href="/dashboard/projects/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">
            <i className="fa-solid fa-plus"></i> Create Project
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
                <th className="p-4">Project Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-semibold text-slate-900">{project.name}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{project.description || "No description"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        project.status === "active" ? "bg-emerald-50 text-emerald-700" :
                        project.status === "on_hold" ? "bg-amber-50 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {project.status?.replace("_", " ") || "Unknown"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/dashboard/projects/${project.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-slate-400 py-10">
                    {!error && (
                      <div>
                        <p className="mb-2">No projects found.</p>
                        {canCreateProject && (
                          <Link href="/dashboard/projects/create" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">
                            <i className="fa-solid fa-plus"></i> Create Your First Project
                          </Link>
                        )}
                      </div>
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