import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { GetProductsQueryType, GetProductsResType } from './product.model'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'

@Injectable()
export class ProductRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(query: GetProductsQueryType, languageId: string): Promise<GetProductsResType> {
    const skip = (query.page - 1) * query.limit
    const take = query.limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.product.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
    ])

    return {
      data,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }
}
