import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { leavesApi, employeesApi } from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID'];

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ employeeId: '', type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [lr, er] = await Promise.all([
        leavesApi.getAll(undefined, statusFilter || undefined),
        employeesApi.getAll(),
      ]);
      setLeaves(lr.data);
      setEmployees(er.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await leavesApi.create({ ...form, employeeId: +form.employeeId });
      toast.success('Leave request created');
      setShowForm(false);
      setForm({ employeeId: '', type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      await leavesApi.updateStatus(id, status);
      toast.success(`Leave ${status.toLowerCase()}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await leavesApi.delete(deleteId);
      toast.success('Leave deleted');
      setDeleteId(null);
      load();
    } catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  const statusBadge = (s: string) => {
    const map: any = { PENDING: 'badge-yellow', APPROVED: 'badge-green', REJECTED: 'badge-red' };
    return <span className={map[s] || 'badge-gray'}>{s}</span>;
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Leave Management"
        subtitle={`${leaves.length} records`}
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus size={16} /> New Request
          </button>
        }
      />

      <div className="card mb-6 flex gap-3">
        {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Period</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Days</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Reason</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No leave records found</td></tr>
              ) : leaves.map((l: any) => {
                const days = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1;
                return (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{l.employee?.firstName} {l.employee?.lastName}</p>
                      <p className="text-xs text-gray-400">{l.employee?.department?.name}</p>
                    </td>
                    <td className="px-5 py-3"><span className="badge-blue">{l.type}</span></td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{days}d</td>
                    <td className="px-5 py-3 text-gray-500 max-w-[160px] truncate">{l.reason || '—'}</td>
                    <td className="px-5 py-3">{statusBadge(l.status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {l.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleStatus(l.id, 'APPROVED')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => handleStatus(l.id, 'REJECTED')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Reject">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => setDeleteId(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Leave Request" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select className="input" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required>
              <option value="">Select employee</option>
              {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Leave Type *</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea className="input" rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Leave" message="Delete this leave request?" isLoading={deleting} />
    </div>
  );
}
