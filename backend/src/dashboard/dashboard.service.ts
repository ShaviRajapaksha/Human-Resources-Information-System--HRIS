import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      todayPresent,
      todayAbsent,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
      this.prisma.department.count(),
      this.prisma.leave.count({ where: { status: 'PENDING' } }),
      this.prisma.attendance.count({ where: { date: { gte: today, lt: tomorrow }, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { date: { gte: today, lt: tomorrow }, status: 'ABSENT' } }),
    ]);

    return { totalEmployees, activeEmployees, totalDepartments, pendingLeaves, todayPresent, todayAbsent };
  }

  async getRecentEmployees() {
    return this.prisma.employee.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { department: { select: { name: true } } },
    });
  }

  async getDepartmentHeadcount() {
    const depts = await this.prisma.department.findMany({
      include: { _count: { select: { employee: true } } },
    });
    return depts.map(d => ({ name: d.name, count: d._count.employee }));
  }

  async getLeaveStats() {
    const [pending, approved, rejected] = await Promise.all([
      this.prisma.leave.count({ where: { status: 'PENDING' } }),
      this.prisma.leave.count({ where: { status: 'APPROVED' } }),
      this.prisma.leave.count({ where: { status: 'REJECTED' } }),
    ]);
    return { pending, approved, rejected };
  }

  async getMonthlyPayrollTrend() {
    const currentYear = new Date().getFullYear();
    const payrolls = await this.prisma.payroll.groupBy({
      by: ['month', 'year'],
      where: { year: currentYear },
      _sum: { netSalary: true },
      orderBy: { month: 'asc' },
    });
    return payrolls.map(p => ({
      month: p.month,
      year: p.year,
      totalPayroll: p._sum.netSalary ?? 0,
    }));
  }
}
