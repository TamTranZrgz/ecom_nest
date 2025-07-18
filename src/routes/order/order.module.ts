import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderRepo } from './order.repo'
import { OrderController } from './order.controller'
import { BullModule } from '@nestjs/bullmq'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { OrderProducer } from './order.producer'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepo, OrderProducer],
  exports: [],
})
export class OrderModule {}
