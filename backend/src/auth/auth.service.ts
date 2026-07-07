import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor( 
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}
  
  async register(registerDto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: {email: registerDto.email}});
    if (exists) throw new ConflictException('Email already in use')

    const hashed = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: registerDto.email, password: hashed, role:registerDto.role},
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { access_token: token, user: {id: user.id, email: user.email, role: user.role}};
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email }})
    if( !user ) throw new UnauthorizedException('Invalid Credentials')

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({sub: user.id, email: user.email, role: user.role });
    return { access_token: token, user: { id: user.id, email: user.email, role: user.role }};
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true, employee: true },
    });
  }  

}
