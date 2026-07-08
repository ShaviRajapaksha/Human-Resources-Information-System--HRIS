import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveType, LeaveStatus } from '@prisma/client';

export class CreateLeaveDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  employeeId!: number;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  type!: LeaveType;

  @ApiProperty({ example: '2024-03-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2024-03-05' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 'Vacation', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveStatusDto {
  @ApiProperty({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  status!: LeaveStatus;
}

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {}
