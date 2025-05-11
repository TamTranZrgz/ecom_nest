import { Module } from '@nestjs/common'
import { BrandTranslationController } from './brand-translation.controller'
import { BrandTranslationService } from './brand-translation.service'
import { BrandTranslationRepo } from './brand-translation.repo'

@Module({
  controllers: [BrandTranslationController],
  providers: [BrandTranslationService, BrandTranslationRepo],
})
export class BrandTranslationModule {}
