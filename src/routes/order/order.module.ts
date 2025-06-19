import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderRepo } from './order.repo'
import { OrderController } from './order.controller'

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepo],
  exports: [],
})
export class OrderModule {}
