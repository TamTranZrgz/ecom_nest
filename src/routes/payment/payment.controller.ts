import { Body, Controller, Post } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { Auth } from 'src/shared/decorator/auth.decorator'
import { WebhookPaymentBodyDTO } from './payment.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/receiver')
  @ZodSerializerDto(MessageResDTO)
  @Auth(['PaymentApiKey'])
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return 'success'
    // return this.paymentService.receiver(body)
  }
}
