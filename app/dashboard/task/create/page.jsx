"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);

  const [projects] = useState([
    { id: 1, name: "Orbit Website Redesign" },
    { id: 2, name: "Laravel Core API" },
    { id: 3, name: "Flutter Mobile App" },
  ]);

  const [developers] = useState([
    { id: 101, name: "Ali Mansour", email: "ali@orbit-eng.net" },
    { id: 102, name: "Rama Ahmad", email: "rama@orbit-eng.net" },
    { id: 103, name: "Hasan Mahmoud", email: "hasan@orbit-eng.net" },
  ]);

  const handleDeveloperToggle = (userId) => {
    if (assignedUsers.includes(userId)) {
      setAssignedUsers(assignedUsers.filter((id) => id !== userId));
    } else {
      setAssignedUsers([...assignedUsers, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (assignedUsers.length === 0) {
      alert("Please assign at least one developer to this task.");
      return;
    }
    alert("Task saved successfully (Mock Mode)!");
    router.push("/dashboard/task");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left" dir="ltr">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create New Task</h2>
        <p className="text-sm text-slate-500 mt-1">
          Assign a task to multiple developers and link it to a project.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Task Title
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
            placeholder="e.g., Secure API Routes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            rows="3"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
            placeholder="Provide task specifications..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Project
            </label>
            <select
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Select a Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Assign Developers
          </label>
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-40 overflow-y-auto space-y-2">
            {developers.map((dev) => (
              <label
                key={dev.id}
                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  checked={assignedUsers.includes(dev.id)}
                  onChange={() => handleDeveloperToggle(dev.id)}
                />
                <div className="text-sm">
                  <span className="font-medium text-slate-900">{dev.name}</span>
                  <span className="text-xs text-slate-400 block">
                    {dev.email}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/dashboard/task")}
            className="px-5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
          >
            Save Task
          </button>
        </div>
      </form>
    </div>
  );
}
