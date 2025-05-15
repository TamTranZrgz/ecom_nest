import { Module } from '@nestjs/common'
import { CategoryTranslationController } from './category-translation.controller'
import { CategoryTranslationService } from './category-translation.service'
import { CategoryTranslationRepo } from './category-translation.repo'

@Module({
  controllers: [CategoryTranslationController],
  providers: [CategoryTranslationService, CategoryTranslationRepo],
})
export class CategoryTranslationModule {}
