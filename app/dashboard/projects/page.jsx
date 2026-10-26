"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { deleteReq, getReq } from "@/lib/api";

export default function ProjectsListPage() {
  const { isAuthenticated, user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const userRole = user?.role || "developer";
  const canCreateProject = userRole === "admin" || userRole === "editor";
  const canEditProject = canCreateProject;
  const canDeleteProject = userRole === "admin";


  useEffect(() => {
    const fetchProjects = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getReq(`/projects?page=${page}`);
        
        //  تعامل مع كل الأشكال (array أو { data: [...] })
        const projectsArray = Array.isArray(response) 
          ? response 
          : (response?.data || []);
        
        setProjects(projectsArray);
        setLastPage(response?.last_page || 1);
        
        console.log("=== PROJECTS RESPONSE ===");
        console.log("response:", response);
        console.log("projectsArray:", projectsArray);
            
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to load projects.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, page]);
  
  const nextPage = () => {
    if (page < lastPage) {
      setPage(page + 1);
    }
  };
  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const handleDelete = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project? All associated tasks will also be deleted. This action cannot be undone.")) {
      return;
    }

    setDeletingProjectId(projectId);
    setError("");

    try {
      await deleteReq(`/projects/${projectId}`);
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
      if (projects.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      }
    } catch (err) {
      setError(err.message || "Failed to delete project.");
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-slate-500">Loading Projects...</div>;
  }

  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects Management</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor, create, and track core company projects.</p>
          <p className="text-xs text-slate-400 mt-1">Showing {projects.length} projects | Role: {userRole}</p>
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
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
                <th className="p-4 text-center">Project Name</th>
                <th className="p-4 text-center">Description</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Created Date</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 text-center font-semibold text-slate-900">{project.name}</td>
                    <td className="p-4 max-w-xs truncate text-center text-slate-500">{project.description || "No description"}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        project.status === "active" ? "bg-emerald-50 text-emerald-700" :
                        project.status === "on_hold" ? "bg-amber-50 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {project.status?.replace("_", " ") || "Unknown"}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xs text-slate-400">
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                          {canEditProject && (
                            <Link
                              href={`/dashboard/projects/${project.id}?edit=1`}
                              className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </Link>
                          )}
                          {canDeleteProject && (
                            <button
                              type="button"
                              onClick={() => handleDelete(project.id)}
                              disabled={deletingProjectId === project.id}
                              className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                            >
                              {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="whitespace-nowrap rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                        >
                          View Details →
                        </Link>
                      </div>
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
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 p-4">
          <span className="inline-flex items-center text-sm text-slate-600">
            Page {page}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={previousPage}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Previous Page
            </button>
            <button
              type="button"
              onClick={nextPage}
              disabled={page >= lastPage}
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