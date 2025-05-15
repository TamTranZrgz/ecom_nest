import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic } from 'src/shared/decorator/auth.decorator'
import { CategoryService } from './category.service'
import {
  CreateCategoryBodyDTO,
  GetAllCategoriesQueryDTO,
  GetAllCategoriesResDTO,
  GetCategoryDetailResDTO,
  GetCategoryParamsDTO,
  UpdateCategoryBodyDTO,
} from './category.dto'
import { ActiveUser } from 'src/shared/decorator/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { request } from 'express'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetAllCategoriesResDTO)
  findAll(@Query() query: GetAllCategoriesQueryDTO) {
    return this.categoryService.findAll(query.parentCategoryId)
  }

  @Get(':categoryId')
  @IsPublic()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  findById(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.findById(params.categoryId)
  }

  @Post()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  create(@Body() body: CreateCategoryBodyDTO, @ActiveUser('userId') userId: number) {
    // console.log('User ID:', userId)
    return this.categoryService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':categoryId')
  @ZodSerializerDto(GetCategoryDetailResDTO)
  update(
    @Body() body: UpdateCategoryBodyDTO,
    @Param() params: GetCategoryParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.update({
      data: body,
      id: params.categoryId,
      updatedById: userId,
    })
  }

  @Delete(':categoryId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetCategoryParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.delete({
      id: params.categoryId,
      deletedById: userId,
    })
  }
}
