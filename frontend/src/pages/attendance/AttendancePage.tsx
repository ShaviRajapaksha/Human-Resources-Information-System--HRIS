import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { attendanceApi, employeesApi } from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatCard from '../../components/ui/StatCard';
import { Clock, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ employeeId: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'PRESENT' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [ar, er, sr] = await Promise.all([
        attendanceApi.getAll(undefined, dateFilter || undefined),
        employeesApi.getAll(),
        attendanceApi.getTodaySummary(),
      ]);
      setRecords(ar.data);
      setEmployees(er.data);
      setSummary(sr.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [dateFilter]);

  const openForm = (rec?: any) => {
    setEditRecord(rec || null);
    setForm({
      employeeId: rec?.employeeId?.toString() || '',
      date: rec?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      checkIn: rec?.checkIn ? new Date(rec.checkIn).toTimeString().slice(0,5) : '',
      checkOut: rec?.checkOut ? new Date(rec.checkOut).toTimeString().slice(0,5) : '',
      status: rec?.status || 'PRESENT',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        employeeId: +form.employeeId,
        date: form.date,
        status: form.status,
        checkIn: form.checkIn ? `${form.date}T${form.checkIn}:00Z` : undefined,
        checkOut: form.checkOut ? `${form.date}T${form.checkOut}:00Z` : undefined,
      };
      if (editRecord) await attendanceApi.update(editRecord.id, payload);
      else await attendanceApi.create(payload);
      toast.success(editRecord ? 'Updated' : 'Created');
      setShowForm(false);
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await attendanceApi.delete(deleteId); toast.success('Deleted'); setDeleteId(null); load(); }
    catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  const statusBadge = (s: string) => {
    const map: any = { PRESENT: 'badge-green', ABSENT: 'badge-red', LATE: 'badge-yellow', HALF_DAY: 'badge-blue' };
    return <span className={map[s] || 'badge-gray'}>{s.replace('_', ' ')}</span>;
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Attendance"
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => openForm()}>
            <Plus size={16} /> Mark Attendance
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Present Today" value={summary?.present ?? 0} icon={UserCheck} color="green" />
        <StatCard title="Absent Today" value={summary?.absent ?? 0} icon={UserX} color="red" />
        <StatCard title="Late Today" value={summary?.late ?? 0} icon={Clock} color="yellow" />
      </div>

      <div className="card mb-6 flex items-center gap-4">
        <label className="label mb-0 whitespace-nowrap">Filter by Date:</label>
        <input type="date" className="input w-48" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <button className="btn-secondary text-sm" onClick={() => setDateFilter('')}>Show All</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Check In</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Check Out</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Hours</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No records found</td></tr>
              ) : records.map((r: any) => {
                const hours = r.checkIn && r.checkOut
                  ? ((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 3600000).toFixed(1)
                  : '—';
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{r.employee?.firstName} {r.employee?.lastName}</p>
                      <p className="text-xs text-gray-400">{r.employee?.department?.name}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-gray-600">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{hours !== '—' ? `${hours}h` : '—'}</td>
                    <td className="px-5 py-3">{statusBadge(r.status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openForm(r)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editRecord ? 'Edit Attendance' : 'Mark Attendance'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select className="input" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required>
              <option value="">Select employee</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Check In</label>
              <input type="time" className="input" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} />
            </div>
            <div>
              <label className="label">Check Out</label>
              <input type="time" className="input" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Record" message="Delete this attendance record?" isLoading={deleting} />
    </div>
  );
}
