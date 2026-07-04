import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    return this.prisma.attendance.create({
      data: {
        ...createAttendanceDto,
        date: new Date(createAttendanceDto.date),
        ...(createAttendanceDto.checkIn && {checkIn: new Date(createAttendanceDto.checkIn)}),
        ...(createAttendanceDto.checkOut && {checkOut: new Date(createAttendanceDto.checkOut)}),
      },
      include: {employee: {select: {firstName: true, lastName: true}}},
    });
  }

  async findAll(employeeId?: number, date?: string) {
    return this.prisma.attendance.findMany({
      where: {
        ...(employeeId && { employeeId }),
        ...(date && { date: { gte: new Date(date), lt: new Date(new Date(date).getTime() + 86400000) } }),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const att = await this.prisma.attendance.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!att) throw new NotFoundException(`Attendance #${id} not found`)
    return att;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    await this.findOne(id)
    return this.prisma.attendance.update({
      where: { id },
      data: {
        ...updateAttendanceDto,
        ...(updateAttendanceDto.date && {date: new Date(updateAttendanceDto.date)}),
        ...(updateAttendanceDto.checkIn && { checkIn: new Date(updateAttendanceDto.checkIn)}),
        ...(updateAttendanceDto.checkOut && { checkOut: new Date(updateAttendanceDto.checkOut)}),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.attendance.delete({ where: {id} });
  }

  async getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const [present, absent, late] = await Promise.all([
      this.prisma.attendance.count({ where: { date: { gte: today, lt: tomorrow }, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { date: { gte: today, lt: tomorrow }, status: 'ABSENT' } }),
      this.prisma.attendance.count({ where: { date: { gte: today, lt: tomorrow }, status: 'LATE' } }),
    ]);

    return { present, absent, late, date: today };
  }  
}
