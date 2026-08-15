"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "universal-cookie";

export default function ProjectsListPage() {
  const cookie = new Cookies();
  const [userRole, setUserRole] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const role = cookie.get("mock_role") || "admin";
    setUserRole(role);
    setIsMounted(true);
  }, []);
  const [projects] = useState([
    {
      id: 1,
      name: "Orbit Website Redesign",
      description:
        "....",
      status: "active",
      created_at: "2026-08-01",
    },
    {
      id: 2,
      name: "Laravel Core API",
      description: "....",
      status: "active",
      created_at: "2026-08-05",
    },
    {
      id: 3,
      name: "Flutter Mobile App",
      description: "....",
      status: "on_hold",
      created_at: "2026-08-10",
    },
    {
      id: 4,
      name: "Legacy System Migration",
      description: "....",
      status: "completed",
      created_at: "2026-07-15",
    },
  ]);

  if (!isMounted)
    return <div className="p-4 text-slate-500">Loading Projects...</div>;

  const canCreateProject = userRole === "admin" || userRole === "editor";

  return (
    <div className="space-y-6 text-left" dir="ltr">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Projects Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor, create, and track core company projects.
          </p>
        </div>
        {canCreateProject && (
          <Link
            href="/dashboard/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <i className="fa-solid fa-plus"></i> Create Project
          </Link>
        )}
      </div>
      {/* Projects table */}
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
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-50/50 transition"
                >
                  <td className="p-4 font-semibold text-slate-900">
                    {project.name}
                  </td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">
                    {project.description}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        project.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : project.status === "on_hold"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {project.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-xs">
                    {project.created_at}
                  </td>
                  <td className="p-4 text-right">
                    {/* Project details */}
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                    >
                      View Details →
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
