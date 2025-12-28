import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: kafkaBrokers,
          },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: kafkaBrokers,
          },
          consumer: {
            groupId: 'api-gateway-user-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
