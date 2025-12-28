import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController implements OnModuleInit {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka
  ) {}

  async onModuleInit() {
    // Subscribe to response topics
    this.userClient.subscribeToResponseOf('user.register');
    this.userClient.subscribeToResponseOf('user.login');
    this.userClient.subscribeToResponseOf('user.profile');
    this.userClient.subscribeToResponseOf('user.verify-token');
    await this.userClient.connect();
  }

  @Post('register')
  async register(@Body() registerDto: any) {
    const result = await firstValueFrom(
      this.userClient.send('user.register', registerDto)
    );
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    const result = await firstValueFrom(
      this.userClient.send('user.login', loginDto)
    );
    return result;
  }

  @Get('profile')
  async getProfile(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    const result = await firstValueFrom(
      this.userClient.send('user.profile', { token })
    );
    return result;
  }
}
