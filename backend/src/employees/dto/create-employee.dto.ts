import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { EmployeeStatus } from '@prisma/client';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  position!: string;

  @ApiProperty({ example: 75000 })
  @IsNumber()
  salary!: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  hireDate!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  departmentId!: number;

  @ApiProperty({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE, required: false })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}