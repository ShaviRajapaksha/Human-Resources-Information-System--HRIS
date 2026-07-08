import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  private generateEmployeeId(): string {
    return `EMP${Date.now().toString().slice(-6)}`;
  }

  async findAll(search?: string, departmentId?: number) {
    return this.prisma.employee.findMany({
      where: {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { position: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(departmentId && { departmentId }),
      },
      include: { department: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        leaves: { orderBy: { createdAt: 'desc' }, take: 5 },
        attendances: { orderBy: { date: 'desc' }, take: 10 },
        payrolls: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });
    if (!emp) throw new NotFoundException(`Employee #${id} not found`);
    return emp;
  }

  async create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        ...dto,
        employeeId: this.generateEmployeeId(),
        hireDate: new Date(dto.hireDate),
      },
      include: { department: true },
    });
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.hireDate && { hireDate: new Date(dto.hireDate) }),
      },
      include: { department: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employee.delete({ where: { id } });
  }
}
