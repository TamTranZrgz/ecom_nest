import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { ProductRepo } from './product.repo'
import { ProductController } from './product.controller'
import { ManageProductService } from './manage-product.service'
import { ManageProductController } from './manage-product.controller'

@Module({
  providers: [ProductService, ProductRepo, ManageProductService],
  controllers: [ProductController, ManageProductController],
})
export class ProductModule {}
