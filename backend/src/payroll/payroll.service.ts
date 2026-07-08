import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollDto, UpdatePayrollStatusDto } from './payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async findAll(employeeId?: number, month?: number, year?: number) {
    return this.prisma.payroll.findMany({
      where: {
        ...(employeeId && { employeeId }),
        ...(month && { month }),
        ...(year && { year }),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(id: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: { employee: { include: { department: true } } },
    });
    if (!payroll) throw new NotFoundException(`Payroll #${id} not found`);
    return payroll;
  }

  async create(dto: CreatePayrollDto) {
    const bonus = dto.bonus ?? 0;
    const deductions = dto.deductions ?? 0;
    const netSalary = dto.basicSalary + bonus - deductions;

    return this.prisma.payroll.create({
      data: { ...dto, bonus, deductions, netSalary },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
  }

  async updateStatus(id: number, dto: UpdatePayrollStatusDto) {
    await this.findOne(id);
    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === 'PROCESSED' && { processedAt: new Date() }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.payroll.delete({ where: { id } });
  }

  async getMonthlySummary(month: number, year: number) {
    const payrolls = await this.prisma.payroll.findMany({
      where: { month, year },
    });

    return {
      month, year,
      total: payrolls.length,
      totalBasic: payrolls.reduce((s, p) => s + p.basicSalary, 0),
      totalBonus: payrolls.reduce((s, p) => s + p.bonus, 0),
      totalDeductions: payrolls.reduce((s, p) => s + p.deductions, 0),
      totalNet: payrolls.reduce((s, p) => s + p.netSalary, 0),
      pending: payrolls.filter(p => p.status === 'PENDING').length,
      processed: payrolls.filter(p => p.status === 'PROCESSED').length,
      paid: payrolls.filter(p => p.status === 'PAID').length,
    };
  }
}
