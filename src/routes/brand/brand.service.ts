import { Injectable } from '@nestjs/common'
import { BrandRepo } from './brand.repo'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { NotFoundRecordException } from 'src/shared/error'
import { CreateBrandBodyType, UpdateBrandBodyType } from './brand.model'
import { isNotFoundPrismaError } from 'src/shared/helper'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { I18nTranslations } from 'src/generated/i18n.generated'

@Injectable()
export class BrandService {
  constructor(
    private brandRepo: BrandRepo,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(pagination: PaginationQueryType) {
    console.log(this.i18n.t('error.NOT_FOUND'), { lang: I18nContext.current()?.lang })
    const data = await this.brandRepo.list(pagination, I18nContext.current()?.lang as string)
    return data
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Finds a brand by its unique identifier.
   *
   * @param id - The unique identifier of the brand to retrieve.
   * @returns The brand object if found.
   * @throws NotFoundRecordException if the brand with the specified id does not exist.
   */

  /*******  60531809-2549-443e-bc32-2b39b68e8d98  *******/
  async findById(id: number) {
    const brand = await this.brandRepo.findById(id, I18nContext.current()?.lang as string)
    if (!brand) {
      throw NotFoundRecordException
    }
    return brand
  }

  create({ data, createdById }: { data: CreateBrandBodyType; createdById: number }) {
    return this.brandRepo.create({
      createdById,
      data,
    })
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateBrandBodyType; updatedById: number }) {
    try {
      const brand = await this.brandRepo.update({
        id,
        updatedById,
        data,
      })
      return brand
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.brandRepo.delete({
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
