import { useEffect, useState } from 'react';
import { Users, Building2, CalendarDays, Clock, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../api';
import StatCard from '../components/ui/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState<any>(null);
  const [payrollTrend, setPayrollTrend] = useState<any[]>([]);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, d, l, p, r] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getDepartmentHeadcount(),
          dashboardApi.getLeaveStats(),
          dashboardApi.getPayrollTrend(),
          dashboardApi.getRecentEmployees(),
        ]);
        setStats(s.data);
        setDeptData(d.data);
        setLeaveStats(l.data);
        setPayrollTrend(p.data.map((x: any) => ({ ...x, monthName: MONTHS[x.month - 1] })));
        setRecentEmployees(r.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  const leaveChartData = leaveStats ? [
    { name: 'Pending', value: leaveStats.pending },
    { name: 'Approved', value: leaveStats.approved },
    { name: 'Rejected', value: leaveStats.rejected },
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Employees" value={stats?.totalEmployees ?? 0} icon={Users} color="blue" subtitle={`${stats?.activeEmployees ?? 0} active`} />
        <StatCard title="Departments" value={stats?.totalDepartments ?? 0} icon={Building2} color="purple" />
        <StatCard title="Pending Leaves" value={stats?.pendingLeaves ?? 0} icon={CalendarDays} color="yellow" subtitle="Awaiting approval" />
        <StatCard title="Present Today" value={stats?.todayPresent ?? 0} icon={Clock} color="green" subtitle={`${stats?.todayAbsent ?? 0} absent`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payroll trend */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-800">Monthly Payroll ({new Date().getFullYear()})</h2>
          </div>
          {payrollTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${v.toLocaleString()}`, 'Total Payroll']} />
                <Bar dataKey="totalPayroll" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No payroll data yet</div>
          )}
        </div>

        {/* Leave stats pie */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-blue-500" />
            <h2 className="font-semibold text-gray-800">Leave Status</h2>
          </div>
          {leaveChartData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leaveChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {leaveChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No leave data yet</div>
          )}
        </div>
      </div>

      {/* Dept headcount + recent employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept headcount */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Department Headcount</h2>
          {deptData.length > 0 ? (
            <div className="space-y-3">
              {deptData.map((d: any) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-36 truncate">{d.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (d.count / Math.max(...deptData.map((x: any) => x.count), 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>

        {/* Recent employees */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Recently Added Employees</h2>
          {recentEmployees.length > 0 ? (
            <div className="space-y-3">
              {recentEmployees.map((emp: any) => (
                <div key={emp.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{emp.position} · {emp.department?.name}</p>
                  </div>
                  <span className={`${emp.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No employees yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
