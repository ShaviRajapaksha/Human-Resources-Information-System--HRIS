import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto, UpdatePayrollStatusDto } from './payroll.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private service: PayrollService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payroll records' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  findAll(
    @Query('employeeId') employeeId?: number,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.service.findAll(
      employeeId ? +employeeId : undefined,
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get monthly payroll summary' })
  @ApiQuery({ name: 'month', type: Number })
  @ApiQuery({ name: 'year', type: Number })
  getMonthlySummary(@Query('month') month: number, @Query('year') year: number) {
    return this.service.getMonthlySummary(+month, +year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create payroll record' })
  create(@Body() dto: CreatePayrollDto) { return this.service.create(dto); }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update payroll status' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayrollStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payroll record' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
