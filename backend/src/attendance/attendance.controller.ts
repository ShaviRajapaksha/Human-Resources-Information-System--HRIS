import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, Put } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Attendance')
@Controller('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Get attendance record' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiQuery({ name: 'emplpoyeeId', required: false, type: Number })
  @ApiQuery({ name: 'date', required: false })
  findAll(@Query('employeeId') empoloyeeId?: number, @Query('date') date?: string) {
    return this.attendanceService.findAll(empoloyeeId ? +empoloyeeId : undefined, date);
  }

  @Get('today-summary')
  @ApiOperation({ summary: 'Get today attendance summary' })
  getTodaySummary() {
    return this.attendanceService.getTodaySummary(); 
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get attendance by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { 
    return this.attendanceService.findOne(id); 
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update attendance record' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attendance record' })
  remove(@Param('id', ParseIntPipe) id: number) { 
    return this.attendanceService.remove(id); 
  }
}
