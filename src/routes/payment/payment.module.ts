import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentRepo } from './payment.repo'
import { PaymentController } from './payment.controller'

@Module({
  providers: [PaymentService, PaymentRepo],
  controllers: [PaymentController],
})
export class PaymentModule {}
