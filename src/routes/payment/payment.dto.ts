import { createZodDto } from 'nestjs-zod'
import { WebhookPaymentBodySchema } from './payment.model'

export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}
