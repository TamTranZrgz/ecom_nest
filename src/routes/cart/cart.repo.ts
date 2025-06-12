import { Injectable } from '@nestjs/common'
import { SKUSchemaType } from 'src/shared/models/shared-sku.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { NotFoundProductException, NotFoundSKUException, OutOfStockSKUException } from './cart.error'
import {
  AddToCartBodyType,
  CartItemType,
  DeleteCartBodyType,
  GetCartResType,
  UpdateCartItemBodyType,
} from './cart.model'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'

@Injectable()
export class CartRepo {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateSKU(skuId: number): Promise<SKUSchemaType> {
    const sku = await this.prismaService.sKU.findUnique({
      where: {
        id: skuId,
        deletedAt: null,
      },
      include: {
        product: true,
      },
    })

    // Check if sku exists
    if (!sku) {
      throw NotFoundSKUException
    }

    // Check inventory
    if (sku.stock < 1) {
      throw OutOfStockSKUException
    }

    const { product } = sku

    // Check if product has been deleted or published
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt !== null && product.publishedAt > new Date())
    ) {
      throw NotFoundProductException
    }

    // return value
    return sku
  }

  async findAll({
    userId,
    languageId,
    limit,
    page,
  }: {
    userId: number
    languageId: string
    limit: number
    page: number
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit
    const take = limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.cartItem.count({
        where: { userId },
      }),
      this.prismaService.cartItem.findMany({
        where: { userId },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
                  },
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    return {
      data,
      totalItems,
      limit,
      page,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async create(userId: number, body: AddToCartBodyType): Promise<CartItemType> {
    await this.validateSKU(body.skuId)
    return await this.prismaService.cartItem.create({
      data: {
        userId,
        skuId: body.skuId,
        quantity: body.quantity,
      },
    })
  }

  async update(cartItemId: number, body: UpdateCartItemBodyType): Promise<CartItemType> {
    await this.validateSKU(body.skuId)
    return await this.prismaService.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: {
        skuId: body.skuId,
        quantity: body.quantity,
      },
    })
  }

  delete(userId: number, body: DeleteCartBodyType): Promise<{ count: number }> {
    return this.prismaService.cartItem.deleteMany({
      where: {
        id: {
          in: body.cartItemIds,
        },
        userId,
      },
    })
  }
}
