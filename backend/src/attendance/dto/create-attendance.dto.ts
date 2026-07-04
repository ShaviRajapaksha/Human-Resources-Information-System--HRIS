import { ApiProperty } from "@nestjs/swagger";
import { AttendanceStatus } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";

export class CreateAttendanceDto {
    @ApiProperty({ example:1 })
    @IsNumber()
    employeeId!: number;

    @ApiProperty({ example: '2026-07-04' })
    @IsDateString()
    date!: string;

    @ApiProperty({ example: '2026-07-04T09:00:00Z', required: false })
    @IsDateString()
    @IsOptional()
    checkIn?: string;

    @ApiProperty({ example: '2024-03-01T17:00:00Z', required: false })
    @IsDateString()
    @IsOptional()
    checkOut?: string;
    
    @ApiProperty({ enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
    @IsEnum(AttendanceStatus)
    @IsOptional()
    status?: AttendanceStatus;
}

