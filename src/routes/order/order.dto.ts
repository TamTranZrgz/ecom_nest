import { createZodDto } from 'nestjs-zod'
import {
  GetOrderListResSchema,
  GetOrderListQuerySchema,
  GetOrderDetailResSchema,
  CreateOrderBodySchema,
  CreateOrderResSchema,
  CancelOrderResSchema,
  GetOrderParamsSchema,
} from './order.model'

export class GetOrderListResDTO extends createZodDto(GetOrderListResSchema) {}

export class GetOrderListQueryDTO extends createZodDto(GetOrderListQuerySchema) {}

export class GetOrderDetailResDTO extends createZodDto(GetOrderDetailResSchema) {}

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class CreateOrderResDTO extends createZodDto(CreateOrderResSchema) {}

export class CancelOrderResDTO extends createZodDto(CancelOrderResSchema) {}

export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}
