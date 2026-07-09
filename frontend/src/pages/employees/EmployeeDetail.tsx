import { useEffect, useState } from 'react';
import { employeesApi } from '../../api';

export default function EmployeeDetail({ employeeId }: { employeeId: number }) {
  const [emp, setEmp] = useState<any>(null);

  useEffect(() => {
    employeesApi.getOne(employeeId).then(r => setEmp(r.data));
  }, [employeeId]);

  if (!emp) return <div className="py-8 text-center text-gray-400">Loading...</div>;

  const statusBadge = (s: string) => {
    const map: any = { ACTIVE: 'badge-green', INACTIVE: 'badge-yellow', TERMINATED: 'badge-red' };
    return <span className={map[s] || 'badge-gray'}>{s}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
          {emp.firstName[0]}{emp.lastName[0]}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{emp.firstName} {emp.lastName}</h3>
          <p className="text-gray-500">{emp.position}</p>
          <div className="flex items-center gap-2 mt-1">{statusBadge(emp.status)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          ['Employee ID', emp.employeeId],
          ['Email', emp.email],
          ['Phone', emp.phone || '—'],
          ['Department', emp.department?.name],
          ['Salary', `$${emp.salary?.toLocaleString()}`],
          ['Hire Date', new Date(emp.hireDate).toLocaleDateString()],
        ].map(([label, val]) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="font-medium text-gray-900">{val}</p>
          </div>
        ))}
      </div>

      {emp.leaves?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Recent Leaves</h4>
          <div className="space-y-2">
            {emp.leaves.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">{l.type}</span>
                <span className="text-gray-500">{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</span>
                <span className={l.status === 'APPROVED' ? 'badge-green' : l.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
