import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { OrderService } from './order.service'
import { CreateOrderBodyDTO, CreateOrderResDTO, GetOrderListQueryDTO, GetOrderListResDTO } from './order.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorator/active-user.decorator'

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  getOrders(@ActiveUser('userId') userId: number, @Query() query: GetOrderListQueryDTO) {
    return this.orderService.list(userId, query)
  }

  @Post()
  @ZodSerializerDto(CreateOrderResDTO)
  createOrder(@ActiveUser('userId') userId: number, @Body() body: CreateOrderBodyDTO) {
    return this.orderService.create(userId, body)
  }
}
