/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

async function bootstrap() {
  // Create HTTP application for REST endpoints
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Connect Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: 'user-consumer-group',
      },
    },
  });

  // Start all microservices
  await app.startAllMicroservices();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 User Microservice is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`🚀 User Microservice is listening to Kafka...`);
}

bootstrap();
