"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getReq, unwrapData } from "@/lib/api";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [stats, setStats] = useState({
    total_projects: 0,
    active_projects: 0,
    total_tasks: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
    high_priority: 0,
    overdue: 0,
    recent_tasks: []
  });

  const [users, setUsers] = useState([]);



  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // 1. جلب إحصائيات الداشبورد
        const dashboardData = unwrapData(await getReq("/dashboard/stats"));

        setStats((prev) => ({
          ...prev,
          total_projects: dashboardData?.total_projects || 0,
          active_projects: dashboardData?.active_projects || 0,
          total_tasks: dashboardData?.total_tasks || 0,
          todo: dashboardData?.todo || 0,
          in_progress: dashboardData?.in_progress || 0,
          review: dashboardData?.review || 0,
          done: dashboardData?.done || 0,
          high_priority: dashboardData?.high_priority || 0,
          overdue: dashboardData?.overdue || 0,
          recent_tasks: dashboardData?.recent_tasks || [],
        }));

        // 2. جلب المستخدمين
        try {
          const usersList = unwrapData(await getReq("/users"));
          setUsers(Array.isArray(usersList) ? usersList : []);
        } catch (err) {
          console.error("Error fetching users:", err);
        }

        // 3. جلب المهام الأخيرة
        try {
          const tasksList = unwrapData(await getReq("/tasks"));
          if (Array.isArray(tasksList) && tasksList.length > 0) {
            const recent = tasksList.slice(-5).reverse();
            setStats((prev) => ({ ...prev, recent_tasks: recent }));
          }
        } catch (err) {
          console.error("Error fetching recent tasks:", err);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // التحقق من الصلاحيات
  const userRole = user?.role || "developer";
  const showQuickActions = userRole === "admin" || userRole === "editor";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="p-4 text-slate-500">Loading Dashboard...</div>;
  }

  if (loading) {
    return (
      <div className="space-y-6 text-left" dir="ltr">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-sm text-slate-500 mt-1">Loading statistics...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-12"></div>
          </div>
          <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left" dir="ltr">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time task and project management statistics.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 uppercase">
          Role: {userRole}
        </span>
      </div>

      {/* عرض الأخطاء */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/projects/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
            >
              <i className="fa-solid fa-folder-plus"></i> Create New Project
            </Link>
            <Link
              href="/dashboard/task/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
            >
              <i className="fa-solid fa-circle-plus"></i> Create New Task
            </Link>
          </div>
        </div>
      )}

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total_projects}</h3>
            <p className="text-xs text-emerald-600 mt-1">
              <i className="fa-solid fa-check-circle"></i> {stats.active_projects} active
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <i className="fa-solid fa-briefcase text-xl"></i>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total_tasks}</h3>
            <p className="text-xs text-rose-600 mt-1">
              <i className="fa-solid fa-exclamation-circle"></i> {stats.overdue} overdue
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <i className="fa-solid fa-list-check text-xl"></i>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Priority</span>
            <h3 className="text-3xl font-bold text-rose-600 mt-1">{stats.high_priority}</h3>
            <p className="text-xs text-slate-400 mt-1">Need immediate attention</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <i className="fa-solid fa-flag text-xl"></i>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Team Members</span>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{users.length}</h3>
            <p className="text-xs text-slate-400 mt-1">Active users</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
            <i className="fa-solid fa-users text-xl"></i>
          </div>
        </div>
      </div>

      {/* توزيع المهام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3">Tasks by Status</h4>
          <div className="space-y-3">
            {[
              { label: "Todo", count: stats.todo, color: "bg-slate-100 text-slate-700" },
              { label: "In Progress", count: stats.in_progress, color: "bg-blue-50 text-blue-700" },
              { label: "Review", count: stats.review, color: "bg-amber-50 text-amber-700" },
              { label: "Done", count: stats.done, color: "bg-emerald-50 text-emerald-700" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3">Tasks by Priority</h4>
          <div className="space-y-3">
            {[
              { label: "High Priority", count: stats.high_priority, color: "bg-rose-50 text-rose-700" },
              { label: "Medium Priority", count: stats.total_tasks - stats.high_priority - (stats.low_priority || 0), color: "bg-amber-50 text-amber-700" },
              { label: "Low Priority", count: stats.low_priority || 0, color: "bg-sky-50 text-sky-700" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h4 className="text-sm font-bold text-slate-800">Recent Tasks</h4>
          <Link href="/dashboard/task" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {stats.recent_tasks && stats.recent_tasks.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-100">
                  <th className="p-4">Task Title</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {stats.recent_tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-semibold text-slate-900">{task.title}</td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-700' : 
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 
                        'bg-sky-50 text-sky-700'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-medium text-slate-600">
                        {task.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/task/${task.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p>No tasks found.</p>
              {showQuickActions && (
                <Link
                  href="/dashboard/task/create"
                  className="inline-flex items-center gap-2 px-4 py-2 mt-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                >
                  <i className="fa-solid fa-plus"></i> Create Your First Task
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}