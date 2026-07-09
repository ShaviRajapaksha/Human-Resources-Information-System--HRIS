import { useState } from 'react';
import { employeesApi } from '../../api';
import toast from 'react-hot-toast';

interface Props {
  employee?: any;
  departments: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, departments, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    position: employee?.position ?? '',
    salary: employee?.salary ?? '',
    hireDate: employee?.hireDate ? employee.hireDate.split('T')[0] : '',
    departmentId: employee?.departmentId ?? '',
    status: employee?.status ?? 'ACTIVE',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, salary: +form.salary, departmentId: +form.departmentId };
      if (employee) await employeesApi.update(employee.id, payload);
      else await employeesApi.create(payload);
      toast.success(employee ? 'Employee updated' : 'Employee created');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Email *</label>
          <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Position *</label>
          <input className="input" value={form.position} onChange={e => set('position', e.target.value)} required />
        </div>
        <div>
          <label className="label">Salary *</label>
          <input type="number" className="input" value={form.salary} onChange={e => set('salary', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Hire Date *</label>
          <input type="date" className="input" value={form.hireDate} onChange={e => set('hireDate', e.target.value)} required />
        </div>
        <div>
          <label className="label">Department *</label>
          <select className="input" value={form.departmentId} onChange={e => set('departmentId', e.target.value)} required>
            <option value="">Select department</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      {employee && (
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (employee ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
}
