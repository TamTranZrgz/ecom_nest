import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CartService } from './cart.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  AddToCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartItemParamsDTO,
  GetCartResDTO,
  UpdateCartItemBodyDTO,
} from './cart.dto'
import { ActiveUser } from 'src/shared/decorator/active-user.decorator'
import { PaginationQueryDTO } from 'src/shared/dtos/request.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ZodSerializerDto(GetCartResDTO)
  getCart(@ActiveUser('userId') userId: number, @Query() query: PaginationQueryDTO) {
    return this.cartService.getCart(userId, query)
  }

  @Post()
  @ZodSerializerDto(CartItemDTO)
  addToCart(@ActiveUser('userId') userId: number, @Body() body: AddToCartBodyDTO) {
    return this.cartService.addToCart(userId, body)
  }

  @Put(':cartItemId')
  @ZodSerializerDto(CartItemDTO)
  updateCartItem(@Param() param: GetCartItemParamsDTO, @Body() body: UpdateCartItemBodyDTO) {
    return this.cartService.updatecartItem(param.cartItemId, body)
  }

  @Post('delete')
  @ZodSerializerDto(MessageResDTO)
  deleteCart(@ActiveUser('userId') userId: number, @Body() body: DeleteCartBodyDTO) {
    return this.cartService.deleteCart(userId, body)
  }
}
