import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './user.repository';
import { PasetoService } from './paseto.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserRepository, PasetoService],
  exports: [AuthService, PasetoService],
})
export class AuthModule {}
