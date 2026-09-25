"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getReq, postReq, updateReq, deleteReq, unwrapData } from "@/lib/api";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id;
  
  const { isAuthenticated, user } = useAuth();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAssignees, setEditAssignees] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [updating, setUpdating] = useState(false);

  const userRole = user?.role || "developer";
  const canEdit = userRole === "admin" || userRole === "editor";
  const canDelete = userRole === "admin";
  
  // assigned_users
  const isUserAssigned = task?.assigned_users?.some(u => u.id === user?.id);
  const canUpdateStatus = 
    userRole === "admin" || 
    userRole === "editor" || 
    (userRole === "developer" && isUserAssigned);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !taskId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        let loadedProjects = [];
        try {
          const projData = unwrapData(await getReq("/projects"));
          loadedProjects = Array.isArray(projData) ? projData : [];
          setProjects(loadedProjects);
        } catch (err) {
          console.error("Error fetching projects:", err);
        }

        try {
          const usersData = unwrapData(await getReq("/users"));
          setAllUsers(Array.isArray(usersData) ? usersData : []);
        } catch (err) {
          console.error("Error fetching users:", err);
        }

        try {
          const taskDetails = unwrapData(await getReq(`/tasks/${taskId}`));

          const project = loadedProjects.find((p) => p.id === taskDetails?.project_id);
          if (taskDetails) {
            taskDetails.projectName = project ? project.name : `Project #${taskDetails?.project_id}`;

            if (taskDetails.comments) {
              setComments(taskDetails.comments);
            }

            if (!taskDetails.assigned_users) {
              taskDetails.assigned_users = [];
            }

            setTask(taskDetails);

            setEditTitle(taskDetails.title || "");
            setEditDescription(taskDetails.description || "");
            setEditProjectId(taskDetails.project_id?.toString() || "");
            setEditPriority(taskDetails.priority || "low");
            setEditDueDate(taskDetails.due_date ? taskDetails.due_date.slice(0, 16) : "");
            setEditAssignees(taskDetails.assigned_users?.map((u) => u.id) || []);
          }
        } catch (taskErr) {
          if (taskErr?.status === 404) {
            setError("Task not found.");
          } else {
            setError(taskErr.message || "Failed to load task details.");
          }
        }

        try {
          const commentsList = unwrapData(await getReq(`/tasks/${taskId}/comments`));
          if (Array.isArray(commentsList)) {
            setComments(commentsList);
          }
        } catch (err) {
          console.error("Error fetching comments:", err);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, isAuthenticated]);

  // ✅ رابط تحديث الحالة
  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    
    try {
      await updateReq(`/tasks/${taskId}/status`, { status: newStatus });

      setTask({ ...task, status: newStatus });
      setSuccess(`Status changed to ${newStatus}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Network error.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const result = await postReq(`/tasks/${taskId}/comments`, { content: newComment });
      const newCommentData = unwrapData(result);
      
      const commentAuthor = user?.name || user?.email || "User";
      
      setComments([
        ...comments,
        {
          id: newCommentData?.id || comments.length + 1,
          author: commentAuthor,
          content: newComment,
          created_at: newCommentData?.created_at || new Date().toISOString(),
        }
      ]);
      setNewComment("");
      setSuccess("Comment added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err.message || "Failed to add comment.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteReq(`/tasks/${taskId}`);
      router.push("/dashboard/task");
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err.message || "Failed to delete task.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formattedDueDate = editDueDate ? new Date(editDueDate).toISOString() : null;

      await updateReq(`/tasks/${taskId}`, {
        title: editTitle,
        description: editDescription || null,
        project_id: editProjectId ? parseInt(editProjectId) : null,
        priority: editPriority,
        due_date: formattedDueDate,
        assigned_users: editAssignees.length > 0 ? editAssignees.map(id => parseInt(id)) : []
      });

      // ✅ أعد جلب المهمة من الـ API
      const updatedTask = unwrapData(await getReq(`/tasks/${taskId}`));

      const project = projects.find((p) => p.id === updatedTask?.project_id);
      if (updatedTask) {
        updatedTask.projectName = project ? project.name : `Project #${updatedTask.project_id}`;

        if (!updatedTask.assigned_users) {
          updatedTask.assigned_users = [];
        }

        setTask(updatedTask);
        setEditAssignees(updatedTask.assigned_users.map(u => u.id) || []);
      }

      setIsEditing(false);
      setSuccess("Task updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.message || "Failed to update task.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssigneeToggle = (userId) => {
    if (editAssignees.includes(userId)) {
      setEditAssignees(editAssignees.filter(id => id !== userId));
    } else {
      setEditAssignees([...editAssignees, userId]);
    }
  };

  if (loading) {
    return <div className="p-4 text-slate-500">Loading Task Details...</div>;
  }

  if (error && !task) {
    return (
      <div className="space-y-6 text-left" dir="ltr">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Task Details</h2>
          <button onClick={() => router.push("/dashboard/task")} className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">← Back</button>
        </div>
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-6 text-left" dir="ltr">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Task Details</h2>
          <button onClick={() => router.push("/dashboard/task")} className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition">← Back</button>
        </div>
        <div className="p-4 text-center text-slate-400">Task not found.</div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6 text-left" dir="ltr">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Update Task</h2>
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title*</label>
            <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Project</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-sm" value={editProjectId} onChange={(e) => setEditProjectId(e.target.value)}>
              <option value="">Select Project</option>
              {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-sm" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
            <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Assign Users</label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-40 overflow-y-auto space-y-2">
              {allUsers.length > 0 ? (
                allUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                    <input type="checkbox" checked={editAssignees.includes(u.id)} onChange={() => handleAssigneeToggle(u.id)} className="w-4 h-4 rounded text-indigo-600 border-slate-300" />
                    <span>{u.name} <span className="text-xs text-slate-400">({u.email})</span></span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-slate-400">No users available.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
            <button type="submit" disabled={updating} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50">{updating ? "Updating..." : "Update Task"}</button>
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
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-2 inline-block">
            {task.projectName || `Project #${task.project_id}`}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
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
          <button onClick={() => router.push("/dashboard/task")} className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition flex items-center gap-2">
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-slate-800">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-slate-800">Assigned Developers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ✅ استخدم assigned_users */}
              {task.assigned_users && task.assigned_users.length > 0 ? (
                task.assigned_users.map((dev) => (
                  <div key={dev.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {dev.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900">{dev.name || dev.email || "Unknown"}</h5>
                      <p className="text-xs text-slate-400">{dev.email || ""}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 col-span-2">No developers assigned.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4 h-fit">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Due Date</span>
            <span className="text-sm font-medium text-slate-800">
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">Priority</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md capitalize ${
              task.priority === "high" ? "bg-rose-50 text-rose-700" :
              task.priority === "medium" ? "bg-amber-50 text-amber-700" :
              "bg-sky-50 text-sky-700"
            }`}>
              {task.priority || "Not set"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status</label>
            <select
              disabled={!canUpdateStatus}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              value={task.status || "todo"}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            {!canUpdateStatus && (
              <p className="text-[10px] text-rose-500 mt-1">You can only update status if you are assigned to this task.</p>
            )}
            {canUpdateStatus && userRole === "developer" && (
              <p className="text-[10px] text-emerald-500 mt-1">✅ You can update status because you are assigned to this task.</p>
            )}
            {canUpdateStatus && (userRole === "admin" || userRole === "editor") && (
              <p className="text-[10px] text-blue-500 mt-1">👑 You can update any task status.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Comments & Discussion ({comments.length})</h4>

        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 items-start p-3 bg-slate-50/70 rounded-xl border border-slate-100/80">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                   {(c.user?.name?.charAt(0) || "U").toUpperCase()}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">{c.user?.name || "Unknown"} </span>
                    <span className="text-[10px] text-slate-400">
                      {c.created_at ? new Date(c.created_at).toLocaleString() : c.timestamp || ""}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>

        <form onSubmit={handleAddComment} className="flex gap-3 pt-2 border-t border-slate-100">
          <input type="text" required className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={submitting} />
          <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50">
            {submitting ? "Sending..." : "Comment"}
          </button>
        </form>
      </div>
    </div>
  );
}