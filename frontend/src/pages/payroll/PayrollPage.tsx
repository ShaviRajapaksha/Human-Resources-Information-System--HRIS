import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, DollarSign } from 'lucide-react';
import { payrollApi, employeesApi } from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', month: new Date().getMonth() + 1,
    year: new Date().getFullYear(), basicSalary: '', bonus: '0', deductions: '0',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [pr, er, sr] = await Promise.all([
        payrollApi.getAll({ month: monthFilter, year: yearFilter }),
        employeesApi.getAll(),
        payrollApi.getSummary(monthFilter, yearFilter),
      ]);
      setRecords(pr.data);
      setEmployees(er.data);
      setSummary(sr.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [monthFilter, yearFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await payrollApi.create({
        ...form,
        employeeId: +form.employeeId,
        basicSalary: +form.basicSalary,
        bonus: +form.bonus,
        deductions: +form.deductions,
      });
      toast.success('Payroll record created');
      setShowForm(false);
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      await payrollApi.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await payrollApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); load(); }
    catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  const statusBadge = (s: string) => {
    const map: any = { PENDING: 'badge-yellow', PROCESSED: 'badge-blue', PAID: 'badge-green' };
    return <span className={map[s] || 'badge-gray'}>{s}</span>;
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = [2023, 2024, 2025, 2026];

  const onEmployeeChange = (id: string) => {
    const emp = employees.find((e: any) => e.id === +id);
    setForm(f => ({ ...f, employeeId: id, basicSalary: emp ? emp.salary.toString() : '' }));
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Payroll"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Payroll
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Records" value={summary?.total ?? 0} icon={DollarSign} color="blue" />
        <StatCard title="Total Net Payout" value={`$${(summary?.totalNet ?? 0).toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard title="Pending" value={summary?.pending ?? 0} icon={DollarSign} color="yellow" />
        <StatCard title="Paid" value={summary?.paid ?? 0} icon={CheckCircle} color="purple" />
      </div>

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-3 items-center">
        <div>
          <label className="label mb-1">Month</label>
          <select className="input w-36" value={monthFilter} onChange={e => setMonthFilter(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label mb-1">Year</label>
          <select className="input w-28" value={yearFilter} onChange={e => setYearFilter(+e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Period</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Basic</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Bonus</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Deductions</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Net</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">No payroll records for this period</td></tr>
              ) : records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{r.employee?.firstName} {r.employee?.lastName}</p>
                    <p className="text-xs text-gray-400">{r.employee?.department?.name}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{MONTHS[r.month - 1]} {r.year}</td>
                  <td className="px-5 py-3 text-right text-gray-700">${r.basicSalary.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-green-600">+${r.bonus.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-red-500">-${r.deductions.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">${r.netSalary.toLocaleString()}</td>
                  <td className="px-5 py-3">{statusBadge(r.status)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === 'PENDING' && (
                        <button onClick={() => handleStatus(r.id, 'PROCESSED')} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                          Process
                        </button>
                      )}
                      {r.status === 'PROCESSED' && (
                        <button onClick={() => handleStatus(r.id, 'PAID')} className="text-xs px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors">
                          Mark Paid
                        </button>
                      )}
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payroll Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Payroll Record">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select className="input" value={form.employeeId} onChange={e => onEmployeeChange(e.target.value)} required>
              <option value="">Select employee</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Month *</label>
              <select className="input" value={form.month} onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year *</label>
              <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Basic Salary *</label>
            <input type="number" className="input" value={form.basicSalary} onChange={e => setForm(f => ({ ...f, basicSalary: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Bonus</label>
              <input type="number" className="input" value={form.bonus} onChange={e => setForm(f => ({ ...f, bonus: e.target.value }))} />
            </div>
            <div>
              <label className="label">Deductions</label>
              <input type="number" className="input" value={form.deductions} onChange={e => setForm(f => ({ ...f, deductions: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <span>Net Salary:</span>
            <span className="font-bold text-gray-900">
              ${(+form.basicSalary + +form.bonus - +form.deductions).toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Payroll" message="Delete this payroll record?" isLoading={deleting} />
    </div>
  );
}
