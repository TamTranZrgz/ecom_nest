import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateOrderBodyType, CreateOrderResType, GetOrderListQueryType, GetOrderListResType } from './order.model'
import { Prisma } from '@prisma/client'
import {
  NotFoundCartItemException,
  OutOfStockSKUException,
  ProductNotFoundException,
  SKUNotBelongToShopException,
} from './order.error'
import { OrderStatus } from 'src/shared/constants/order.constant'

@Injectable()
export class OrderRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
    const { page, limit, status } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.OrderWhereInput = {
      userId,
      status,
    }

    // Count no. of orders
    const totalItem$ = this.prismaService.order.count({
      where,
    })

    // Get ordert list
    const data$ = await this.prismaService.order.findMany({
      where,
      include: {
        items: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const [data, totalItems] = await Promise.all([data$, totalItem$])

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async create(userId: number, body: CreateOrderBodyType): Promise<CreateOrderResType> {
    const allBodyCartItemIds = body.map((item) => item.cartItemsIds).flat()

    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: {
          in: allBodyCartItemIds,
        },
        userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    })

    // 1. Check all items in cartItems are available in db
    if (cartItems.length !== allBodyCartItemIds.length) throw NotFoundCartItemException

    // 2. Check if no. of bought items is available in stock
    const isOutOfStock = cartItems.some((item) => item.sku.stock < item.quantity)
    if (isOutOfStock) throw OutOfStockSKUException

    // 3. CHeck all items if there is item which is deleted or hidden
    const isExistNotReadyProduct = cartItems.some(
      (item) =>
        item.sku.product.deletedAt !== null ||
        item.sku.product.publishedAt === null ||
        item.sku.product.publishedAt > new Date(),
    )
    if (isExistNotReadyProduct) throw ProductNotFoundException

    // 4. Check all sku in cartItems if they belong to the shopId who sell the product
    const cartItemMap = new Map<number, (typeof cartItems)[0]>()
    cartItems.forEach((item) => {
      cartItemMap.set(item.id, item)
    })

    const isValidShop = body.every((item) => {
      const bodyCartItemIds = item.cartItemsIds
      return bodyCartItemIds.every((cartItemId) => {
        // Until this step, cartItem always exist and has value
        // Because we have compare with allBodyCartItems.length in step 1
        const cartItem = cartItemMap.get(cartItemId)!
        return item.shopId === cartItem.sku.createdById
      })
    })

    if (!isValidShop) throw SKUNotBelongToShopException

    // 5. Create order and Delete cartItem in transaction to assure the completeness of data
    const orders = await this.prismaService.$transaction(async (tx) => {
      const orders = await Promise.all(
        body.map((item) =>
          tx.order.create({
            data: {
              userId,
              status: OrderStatus.PENDING_PAYMENT,
              receiver: item.receiver,
              createdById: userId,
              shopId: item.shopId,
              items: {
                create: item.cartItemsIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!
                  return {
                    productName: cartItem.sku.product.name,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    skuId: cartItem.sku.id,
                    skuValue: cartItem.sku.value,
                    quantity: cartItem.quantity,
                    productId: cartItem.sku.product.id,
                    productTranslations: cartItem.sku.product.productTranslations.map((translation) => {
                      return {
                        id: translation.id,
                        name: translation.name,
                        description: translation.description,
                        languageId: translation.languageId,
                      }
                    }),
                  }
                }),
              },
              products: {
                connect: item.cartItemsIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!
                  return {
                    id: cartItem.sku.product.id,
                  }
                }),
              },
            },
          }),
        ),
      )

      await tx.cartItem.deleteMany({
        where: {
          id: {
            in: allBodyCartItemIds,
          },
        },
      })

      return orders
    })

    return {
      data: orders,
    }
  }
}
