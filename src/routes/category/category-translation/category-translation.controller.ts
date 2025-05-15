import { Body, Controller, Delete, Param, Put, Post, Get } from '@nestjs/common'
import { CategoryTranslationService } from './category-translation.service'
import {
  CreateCategoryTranslationBodyDTO,
  GetCategoryTranslationDetailResDTO,
  GetCategoryTranslationParamsDTO,
  UpdateCategoryTranslationBodyDTO,
} from './category-translattion.dto'
import { ActiveUser } from 'src/shared/decorator/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('category-translations')
export class CategoryTranslationController {
  constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

  @Get(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.findById(params.categoryTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  create(@Body() body: CreateCategoryTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  update(
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @Param() params: GetCategoryTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryTranslationService.update({
      data: body,
      id: params.categoryTranslationId,
      updatedById: userId,
    })
  }

  @Delete(':categoryTranslationId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetCategoryTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.delete({
      id: params.categoryTranslationId,
      deletedById: userId,
    })
  }
}
