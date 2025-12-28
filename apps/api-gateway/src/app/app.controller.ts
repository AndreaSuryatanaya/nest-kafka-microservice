import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ClientKafka } from '@nestjs/microservices';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    // Connect to Kafka
    await this.kafkaClient.connect();
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('order')
  @UseGuards(AuthGuard)
  createOrder(@Body() order: any, @CurrentUser() user: any) {
    // Include user info in the order
    const orderWithUser = {
      ...order,
      userId: user.sub,
      userEmail: user.email,
    };
    this.kafkaClient.emit('order-created', orderWithUser);
    return { message: 'Order sent to kafka', order: orderWithUser };
  }
}
