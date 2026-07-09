import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { employeesApi, departmentsApi } from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import EmployeeForm from './EmployeeForm';
import EmployeeDetail from './EmployeeDetail';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [viewEmployee, setViewEmployee] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        employeesApi.getAll(search || undefined, deptFilter ? +deptFilter : undefined),
        departmentsApi.getAll(),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, deptFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await employeesApi.delete(deleteId);
      toast.success('Employee deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: any = { ACTIVE: 'badge-green', INACTIVE: 'badge-yellow', TERMINATED: 'badge-red' };
    return <span className={map[s] || 'badge-gray'}>{s}</span>;
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} total employees`}
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => { setEditEmployee(null); setShowForm(true); }}>
            <Plus size={16} /> Add Employee
          </button>
        }
      />

      {/* Filters */}
      <div className="card mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, email, position..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-48" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Department</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Position</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Salary</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No employees found</td></tr>
              ) : employees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-gray-400 text-xs">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{emp.employeeId}</td>
                  <td className="px-5 py-3 text-gray-600">{emp.department?.name}</td>
                  <td className="px-5 py-3 text-gray-600">{emp.position}</td>
                  <td className="px-5 py-3 text-gray-700 font-medium">${emp.salary.toLocaleString()}</td>
                  <td className="px-5 py-3">{statusBadge(emp.status)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewEmployee(emp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => { setEditEmployee(emp); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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

      {/* Modals */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editEmployee ? 'Edit Employee' : 'Add Employee'}
        size="lg"
      >
        <EmployeeForm
          employee={editEmployee}
          departments={departments}
          onSuccess={() => { setShowForm(false); load(); }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal isOpen={!!viewEmployee} onClose={() => setViewEmployee(null)} title="Employee Details" size="lg">
        {viewEmployee && <EmployeeDetail employeeId={viewEmployee.id} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        isLoading={deleting}
      />
    </div>
  );
}
