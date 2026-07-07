import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: 'admin@hris.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@hris.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: Role, default: Role.HR })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}


export class AuthResponseDto {
    @ApiProperty()
    access_token!: string;

    @ApiProperty()
    user!: {
        id: number;
        email: string;
        role: string;
    }
}