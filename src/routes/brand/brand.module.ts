import { Module } from '@nestjs/common'
import { BrandController } from './brand.controller'
import { BrandService } from './brand.service'
import { BrandTranslationModule } from './brand-translation/brand-translation.module'
import { BrandRepo } from './brand.repo'

@Module({
  controllers: [BrandController],
  providers: [BrandService, BrandRepo],
  imports: [BrandTranslationModule],
})
export class BrandModule {}
