import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }
 
  @Get('recent-employees')
  @ApiOperation({ summary: 'Get recently added employees' })
  getRecentEmployees() {
    return this.dashboardService.getRecentEmployees();
  }  
 
  @Get('department-headcount')
  @ApiOperation({ summary: 'Get employee count per department' })
  getDepartmentHeadcount() {
    return this.dashboardService.getDepartmentHeadcount();
  } 

  @Get('leave-stats')
  @ApiOperation({ summary: 'Get leave statistics' })
  getLeaveStats() { 
    return this.dashboardService.getLeaveStats(); 
  }

  @Get('payroll-trend')
  @ApiOperation({ summary: 'Get monthly payroll trend for current year' })
  getMonthlyPayrollTrend() { 
    return this.dashboardService.getMonthlyPayrollTrend(); 
  }

}
