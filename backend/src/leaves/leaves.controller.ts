import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, UpdateLeaveStatusDto } from './leaves.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Leaves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaves')
export class LeavesController {
  constructor(private service: LeavesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leaves' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('employeeId') employeeId?: number, @Query('status') status?: string) {
    return this.service.findAll(employeeId ? +employeeId : undefined, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create a leave request' })
  create(@Body() dto: CreateLeaveDto) { return this.service.create(dto); }

  @Put(':id/status')
  @ApiOperation({ summary: 'Approve or reject a leave' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeaveStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a leave request' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
