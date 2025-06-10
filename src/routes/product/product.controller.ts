import { Controller, Get, Param, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic } from 'src/shared/decorator/auth.decorator'
import { ProductService } from './product.service'
import { GetProductDetailResDTO, GetProductParamsDTO, GetProductsQueryDTO, GetProductsResDTO } from './product.dto'

@Controller('products')
@IsPublic()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list({
      query,
    })
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  getDetail(@Param() params: GetProductParamsDTO) {
    return this.productService.getDetail({
      productId: params.productId,
    })
  }
}
