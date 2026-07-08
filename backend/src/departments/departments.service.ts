import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}
  
  async findAll() {
    return this.prisma.department.findMany({
      include: { _count: { select: {employee: true } } },
      orderBy: { name: 'desc' }
    });
  }

  async findOne(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, position: true, status: true } } },
    });
    if(!dept) throw new NotFoundException(`Department #${id} not found`)
    return dept;
  }
  
  async create(createDepartmentDto: CreateDepartmentDto) {
    const exists = await this.prisma.department.findUnique({ where: { name: createDepartmentDto.name }});
    if(exists) throw new ConflictException('Department name already exist')
     return this.prisma.department.create({ data: createDepartmentDto })
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id);
    return this.prisma.department.update({where: {id}, data: updateDepartmentDto});
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.department.delete({ where: { id } });
  }
}
