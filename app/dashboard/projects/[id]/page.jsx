"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProjectDetailPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [project] = useState({
    id: 1,
    name: "Orbit Website Redesign",
    description: "...",
    status: "active",
    created_at: "2026-08-01",
  });
  const [projectTasks] = useState([
    {
      id: 3,
      title: "Create Next.js Sidebar Component",
      priority: "medium",
      status: "review",
      developers: "Ali, Rama",
    },
    {
      id: 4,
      title: "Fix Multi-Select Dropdown Bug",
      priority: "low",
      status: "todo",
      developers: "Ali Mansour",
    },
  ]);

  if (!isMounted)
    return <div className="p-4 text-slate-500">Loading Project Details...</div>;
  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase mb-2 inline-block">
            {project.status}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
        </div>
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition"
        >
          ← Back to Projects
        </button>
      </div>
      {/* Project details */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-2">
        <h4 className="text-sm font-bold text-slate-800">
          Project Description
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
          {project.description}
        </p>
        <span className="text-xs text-slate-400 block pt-1">
          Created on: {project.created_at}
        </span>
      </div>
      {/* Project tasks */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">
          Project Tasks ({projectTasks.length})
        </h3>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
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
              {projectTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-semibold text-slate-900">
                    {task.title}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        task.priority === "high"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="capitalize font-medium text-slate-600">
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {task.developers}
                  </td>
                  <td className="p-4 text-right">
                    {/* task details */}
                    <Link
                      href={`/dashboard/task/${task.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                    >
                      Open Task →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
