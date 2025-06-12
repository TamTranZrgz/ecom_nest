import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsResType,
  UpdateProductBodyType,
} from './product.model'
import { ALL_LANGUAGE_CODE, OrderBy, OrderByType, SortBy, SortByType } from 'src/shared/constants/other.constant'
import { Prisma } from '@prisma/client'
import { ProductType } from 'src/shared/models/shared-product.model'

@Injectable()
export class ProductRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list({
    limit,
    page,
    name,
    brandIds,
    categories,
    minPrice,
    maxPrice,
    createdById,
    isPublic,
    languageId,
    orderBy,
    sortBy,
  }: {
    limit: number
    page: number
    name?: string
    brandIds?: number[]
    categories?: number[]
    minPrice?: number
    maxPrice?: number
    createdById?: number
    isPublic?: boolean
    languageId: string
    orderBy: OrderByType
    sortBy: SortByType
  }): Promise<GetProductsResType> {
    const skip = (page - 1) * limit
    const take = limit

    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById: createdById ? createdById : undefined,
    }

    // FILTER
    if (isPublic === true) {
      where.publishedAt = { lte: new Date(), not: null }
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }

    if (name) where.name = { contains: name, mode: 'insensitive' } // not differentiate between lowercase and uppercase

    if (brandIds && brandIds.length > 0) where.brandId = { in: brandIds }

    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          id: {
            in: categories,
          },
        },
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {
        gte: minPrice,
        lte: maxPrice,
      }
    }

    // Default: sort by createdAt DESC
    let calculatedOrderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: orderBy,
    }

    if (sortBy === SortBy.Price) {
      calculatedOrderBy = {
        basePrice: orderBy,
      }
    } else if (sortBy === SortBy.Sale) {
      calculatedOrderBy = {
        orders: {
          _count: orderBy,
        },
      }
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where,
      }),
      this.prismaService.product.findMany({
        where,
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
          orders: {
            where: {
              deletedAt: null,
              status: 'DELIVERED',
            },
          },
        },
        orderBy: calculatedOrderBy,
        skip,
        take,
      }),
    ])

    return {
      data,
      totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  findById(productId: number): Promise<ProductType | null> {
    return this.prismaService.product.findUnique({ where: { id: productId, deletedAt: null } })
  }

  getDetail({
    productId,
    languageId,
    isPublic,
  }: {
    productId: number
    languageId: string
    isPublic?: boolean
  }): Promise<GetProductDetailResType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id: productId,
      deletedAt: null,
    }

    if (isPublic === true) {
      where.publishedAt = { lte: new Date(), not: null }
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }

    return this.prismaService.product.findUnique({
      where,
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number | null
    data: CreateProductBodyType
  }): Promise<GetProductDetailResType> {
    const { skus, categories, ...productData } = data
    return this.prismaService.product.create({
      data: {
        createdById,
        ...productData,
        categories: { connect: categories.map((category) => ({ id: category })) }, // not create new categories, but create new items in _categoryToProduct table
        skus: {
          createMany: {
            data: skus, // create new SKUs
          },
        },
      },
      include: {
        productTranslations: {
          where: { deletedAt: null },
        },
        skus: {
          where: { deletedAt: null },
        },
        brand: {
          include: {
            brandTranslations: {
              where: { deletedAt: null },
            },
          },
        },
        categories: {
          where: { deletedAt: null },
          include: {
            categoryTranslations: {
              where: { deletedAt: null },
            },
          },
        },
      },
    })
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdateProductBodyType
  }): Promise<ProductType> {
    const { skus: dataSkus, categories, ...productData } = data

    // if SKU exists in DB, but not in data payload => delete it
    // if SKU exists in data payload, but not in DB => create it
    // if SKU exists in both => update it

    // 1. Get list of SKU exist in db
    const existingSkus = await this.prismaService.sKU.findMany({
      where: {
        productId: id,
        deletedAt: null,
      },
    })

    // 2. Find SKUs need to be deleted (available in db but not in data payload)
    const skusToDelete = existingSkus.filter((sku) => dataSkus.every((dataSku) => dataSku.value !== sku.value))
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id)

    // 3. Mapping id into data payload
    const skusWithId = dataSkus.map((dataSku) => {
      const existingSku = existingSkus.find((existingSku) => existingSku.value === dataSku.value)
      return {
        ...dataSku,
        id: existingSku ? existingSku.id : null,
      }
    })

    // 4. Find SKUs need to be updated
    const skusToUpdate = skusWithId.filter((sku) => sku.id !== null)

    // 5. Find SKUs need to be created
    const skusToCreate = skusWithId
      .filter((sku) => sku.id === null)
      .map((sku) => {
        const { id: skuId, ...data } = sku
        return {
          ...data,
          productId: id,
          createdById: updatedById,
        }
      })

    const [product] = await this.prismaService.$transaction([
      // Update Product
      this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...productData,
          updatedById,
          categories: {
            connect: categories.map((category) => ({ id: category })),
          },
        },
      }),

      // Soft delete skus not in data payload
      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedAt: new Date(),
          deletedById: updatedById,
        },
      }),

      // Update skus available in data payload
      ...skusToUpdate.map((sku) =>
        this.prismaService.sKU.update({
          where: {
            id: sku.id as number,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        }),
      ),

      // create new skus that not exist in DB
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ])

    return product
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<ProductType> {
    if (isHard) {
      return this.prismaService.product.delete({
        where: {
          id,
        },
      })
    }

    const now = new Date()

    const [product] = await Promise.all([
      this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
          deletedById,
        },
      }),

      this.prismaService.productTranslation.updateMany({
        where: {
          productId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
          deletedById,
        },
      }),

      this.prismaService.sKU.updateMany({
        where: {
          productId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
          deletedById,
        },
      }),
    ])

    return product
  }
}
