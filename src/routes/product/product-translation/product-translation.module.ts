import { Module } from '@nestjs/common'
import { ProductTranslationRepo } from './product-translation.repo'
import { ProductTranslationService } from './product-translation.service'
import { ProductTranslationController } from './product-translation.controller'

@Module({
  providers: [ProductTranslationRepo, ProductTranslationService],
  controllers: [ProductTranslationController],
})
export class ProductTranslationModule {}
