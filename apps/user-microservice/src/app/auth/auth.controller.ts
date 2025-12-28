import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // HTTP Endpoints
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header'
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await this.authService.verifyToken(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Kafka Message Patterns for microservice communication
  @MessagePattern('user.register')
  async handleUserRegister(@Payload() registerDto: RegisterDto) {
    console.log(
      '[User-Service]: Received register request via Kafka',
      registerDto
    );
    return this.authService.register(registerDto);
  }

  @MessagePattern('user.login')
  async handleUserLogin(@Payload() loginDto: LoginDto) {
    console.log('[User-Service]: Received login request via Kafka', loginDto);
    return this.authService.login(loginDto);
  }

  @MessagePattern('user.profile')
  async handleGetProfile(@Payload() data: { token: string }) {
    console.log('[User-Service]: Received profile request via Kafka');

    if (!data.token) {
      throw new UnauthorizedException('Missing token');
    }

    const payload = await this.authService.verifyToken(data.token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  @MessagePattern('user.verify-token')
  async handleVerifyToken(@Payload() data: { token: string }) {
    console.log(
      '[User-Service]: Received token verification request via Kafka'
    );
    return this.authService.verifyToken(data.token);
  }
}
