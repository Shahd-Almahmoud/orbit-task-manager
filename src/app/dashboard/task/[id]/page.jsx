"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "universal-cookie";

export default function TaskDetailPage() {
  const router = useRouter();
  const cookie = new Cookies();[]
  const [userRole, setUserRole] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [task, setTask] = useState({
    id: 1,
    title: "Integrate Laravel Sanctum Auth",
    description: "....",
    projectName: "Laravel Core API",
    priority: "high",
    status: "in_progress",
    due_date: "2026-08-25",
    assignees: [
      { id: 101, name: "Ali Mansour", email: "ali@orbit-eng.net" },
      { id: 102, name: "Rama Ahmad", email: "rama@orbit-eng.net" },
    ],
  });

  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Ali Mansour",
      content: "I migration tables are ready.",
      timestamp: "2026-08-13 14:30",
    },
    {
      id: 2,
      author: "Rama Ahmad",
      content: "Great work, testing now.",
      timestamp: "2026-08-13 15:00",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const role = cookie.get("mock_role") || "admin";
    setUserRole(role);
    setIsMounted(true);
  }, []);

  const handleStatusChange = (newStatus) => {
    setTask({ ...task, status: newStatus });
    alert(`Status changed to ${newStatus}`);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentAuthor =
      userRole === "developer"
        ? "Ali Mansour"
        : userRole === "editor"
          ? "Rama Ahmad"
          : "Admin User";

    setComments([
      ...comments,
      {
        id: comments.length + 1,
        author: commentAuthor,
        content: newComment,
        timestamp: new Date().toLocaleString(),
      },
    ]);
    setNewComment("");
  };

  if (!isMounted)
    return <div className="p-4 text-slate-500">Loading Task Details...</div>;

  const canUpdateStatus = userRole === "admin" || userRole === "editor";

  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-2 inline-block">
            {task.projectName}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded uppercase">
            Viewing as: {userRole}
          </span>
          <button
            onClick={() => router.push("/dashboard/task")}
            className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-slate-800">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {task.description}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
            <h4 className="text-sm font-bold text-slate-800">
              Assigned Developers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {task.assignees.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 select-none">
                    {dev.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900">
                      {dev.name}
                    </h5>
                    <p className="text-xs text-slate-400">{dev.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4 h-fit">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">
              Due Date
            </span>
            <span className="text-sm font-medium text-slate-800">
              {task.due_date}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase mb-1">
              Priority
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 capitalize">
              {task.priority}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Status
            </label>
            <select
              disabled={!canUpdateStatus}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            {!canUpdateStatus && (
              <p className="text-[10px] text-rose-500 mt-1">
                Status can only be updated by Admin or Editor.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
          Comments & Discussion
        </h4>

        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="flex gap-3 items-start p-3 bg-slate-50/70 rounded-xl border border-slate-100/80"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 select-none">
                {c.author.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">
                    {c.author}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {c.timestamp}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddComment}
          className="flex gap-3 pt-2 border-t border-slate-100"
        >
          <input
            type="text"
            required
            className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
          >
            Comment
          </button>
        </form>
      </div>
    </div>
  );
}
