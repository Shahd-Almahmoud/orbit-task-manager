"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getReq, updateReq, deleteReq, unwrapData } from "@/lib/api";

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id: projectId } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [isMounted, setIsMounted] = useState(false);
  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const userRole = user?.role || "developer";
  const canEdit = userRole === "admin" || userRole === "editor";
  const canDelete = userRole === "admin";

  useEffect(() => {
    setIsMounted(true);

    const fetchProjectDetails = async () => {
      if (!projectId) return;

      if (isAuthenticated) {
        try {
          const data = unwrapData(await getReq(`/projects/${projectId}`));

          setProject(data);
          setProjectTasks(data?.tasks || []);
          
          setEditName(data?.name || "");
          setEditDescription(data?.description || "");
          setEditStatus(data?.status || "active");
        } catch (err) {
          console.error("Project Details Error:", err);
          setError(err.message || "Database error or server connection failed.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("Session expired. Please login to view project database details.");
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, isAuthenticated]);

  const handleStatusChange = async (newStatus) => {
    if (!project) return;

    try {
      const updatedProject = unwrapData(
        await updateReq(`/projects/${projectId}/status`, { status: newStatus })
      );
      setProject(updatedProject);
      setSuccess(`Status changed to ${newStatus}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Failed to update status.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updatedProject = unwrapData(
        await updateReq(`/projects/${projectId}`, {
          name: editName,
          description: editDescription || null,
          status: editStatus,
        })
      );
      setProject(updatedProject);
      setIsEditing(false);
      setSuccess("Project updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err.message || "Failed to update project.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? All associated tasks will also be deleted. This action cannot be undone.")) {
      return;
    }

    try {
      await deleteReq(`/projects/${projectId}`);
      router.push("/dashboard/projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err.message || "Failed to delete project.");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (!isMounted || loading) {
    return <div className="p-4 text-slate-500">Loading Project Details from Database...</div>;
  }

  if (error || !project) {
    return (
      <div className="p-6 text-center max-w-md mx-auto bg-white rounded-xl border border-slate-100 shadow-sm mt-10 space-y-3">
        <div className="text-rose-500 text-2xl"><i className="fa-solid fa-circle-exclamation"></i></div>
        <h4 className="text-md font-bold text-slate-800">Error Loading Data</h4>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={() => router.push("/dashboard/projects")} className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg">Back to List</button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6 text-left" dir="ltr">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Edit Project</h2>
          <button onClick={() => setIsEditing(false)} className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">Cancel</button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5 max-w-2xl">
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name*</label>
            <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-sm" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={updating} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50">{updating ? "Updating..." : "Update Project"}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left" dir="ltr">
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

      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase mb-2 inline-block ${
            project.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
            project.status === 'on_hold' ? 'bg-amber-50 text-amber-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {project.status}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-2">
              <i className="fa-solid fa-pen"></i> Update
            </button>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition flex items-center gap-2">
              <i className="fa-solid fa-trash"></i> Delete
            </button>
          )}
          <button onClick={() => router.push("/dashboard/projects")} className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition flex items-center gap-2">
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
        <h4 className="text-sm font-bold text-slate-800">Project Description</h4>
        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
          {project.description || "No description provided."}
        </p>
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs text-slate-400">Created on: {project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}</span>
          <span className="text-xs text-slate-400">Updated: {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "N/A"}</span>
        </div>
      </div>

      {canEdit && (
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-3">Update Project Status</h4>
          <div className="flex items-center gap-3">
            <select className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-sm" value={project.status || "active"} onChange={(e) => handleStatusChange(e.target.value)}>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
            <span className="text-xs text-slate-400">Change project status</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Project Tasks ({projectTasks.length})</h3>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
                  <th className="p-4">Task Title</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Devs</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {projectTasks.length > 0 ? (
                  projectTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-semibold text-slate-900">{task.title}</td>
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
                      <td className="p-4 text-slate-500 text-xs">
                        {task.assignees?.map(d => d.name).join(', ') || "Unassigned"}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/task/${task.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">
                          Open Task →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-slate-400 py-6">
                      No tasks linked to this project in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}