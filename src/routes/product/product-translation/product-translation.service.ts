import { Injectable } from '@nestjs/common'
import { ProductTranslationRepo } from './product-translation.repo'
import { NotFoundRecordException } from 'src/shared/error'
import { CreateProductTranslationBodyType, UpdateProductTranslationBodyType } from './product-translation.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper'
import { ProductTranslationAlreadyExistsException } from './product-translation.error'

@Injectable()
export class ProductTranslationService {
  constructor(private productTranslationRepo: ProductTranslationRepo) {}

  async findById(id: number) {
    const product = await this.productTranslationRepo.findById(id)
    if (!product) {
      throw NotFoundRecordException
    }
    return product
  }

  async create({ data, createdById }: { data: CreateProductTranslationBodyType; createdById: number }) {
    try {
      return await this.productTranslationRepo.create({
        createdById,
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateProductTranslationBodyType; updatedById: number }) {
    try {
      const product = await this.productTranslationRepo.update({
        id,
        updatedById,
        data,
      })
      return product
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ProductTranslationAlreadyExistsException
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.productTranslationRepo.delete({
        id,
        deletedById,
      })
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
