import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateDepartmentDto {
    @ApiProperty({ example: 'Engineering' })
    @IsString()
    name!: string;

    @ApiProperty({ example: 'Software engineering team', required: false })
    @IsString()
    @IsOptional()
    description?: string;
}
