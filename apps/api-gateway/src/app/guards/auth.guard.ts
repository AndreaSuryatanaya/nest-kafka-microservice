import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header'
      );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify token via user-microservice through Kafka
      const user = await firstValueFrom(
        this.userClient.send('user.verify-token', { token }).pipe(
          timeout(5000),
          catchError(() => {
            throw new UnauthorizedException('Token verification failed');
          })
        )
      );

      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Attach user to request for use in controllers
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
