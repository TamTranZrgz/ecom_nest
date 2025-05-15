import { createZodDto } from 'nestjs-zod'
import {
  CreateCategoryTranslationBodySchema,
  GetCategoryTranslationDetailResSchema,
  GetCategoryTranslationParamsSchema,
  UpdateCategoryTranslationBodySchema,
} from './category-translattion.model'

export class GetCategoryTranslationDetailResDTO extends createZodDto(GetCategoryTranslationDetailResSchema) {}

export class GetCategoryTranslationParamsDTO extends createZodDto(GetCategoryTranslationParamsSchema) {}

export class CreateCategoryTranslationBodyDTO extends createZodDto(CreateCategoryTranslationBodySchema) {}

export class UpdateCategoryTranslationBodyDTO extends createZodDto(UpdateCategoryTranslationBodySchema) {}
