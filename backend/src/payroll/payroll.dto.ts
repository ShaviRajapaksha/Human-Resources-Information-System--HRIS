import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { PayrollStatus } from '@prisma/client';

export class CreatePayrollDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  employeeId!: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1) @Max(12)
  month!: number;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  year!: number;

  @ApiProperty({ example: 75000 })
  @IsNumber()
  basicSalary!: number;

  @ApiProperty({ example: 5000, required: false })
  @IsNumber()
  @IsOptional()
  bonus?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  deductions?: number;
}

export class UpdatePayrollStatusDto {
  @ApiProperty({ enum: PayrollStatus })
  @IsEnum(PayrollStatus)
  status!: PayrollStatus;
}

export class UpdatePayrollDto extends PartialType(CreatePayrollDto) {}
