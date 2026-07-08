import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './leaves.dto';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async findAll(employeeId?: number, status?: string) {
    return this.prisma.leave.findMany({
      where: {
        ...(employeeId && { employeeId }),
        ...(status && { status: status as any }),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: { employee: { include: { department: true } } },
    });
    if (!leave) throw new NotFoundException(`Leave #${id} not found`);
    return leave;
  }

  async create(dto: CreateLeaveDto) {
    return this.prisma.leave.create({
      data: { ...dto, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });
  }

  async updateStatus(id: number, dto: UpdateLeaveStatusDto) {
    await this.findOne(id);
    return this.prisma.leave.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.leave.delete({ where: { id } });
  }
}
