import { ProductSchema } from 'src/shared/models/shared-product.model'
import { SKUSchema } from 'src/shared/models/shared-sku.model'
import { z } from 'zod'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { ProductTranslationSchema } from 'src/shared/models/sahred-product-translation.model'

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive(),
  skuId: z.number(),
  userId: z.number(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const GetCartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
})

export const CartItemDetailSchema = z.object({
  shop: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SKUSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(
            ProductTranslationSchema.omit({
              createdById: true,
              updatedById: true,
              deletedById: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            }),
          ),
        }).omit({
          createdById: true,
          updatedById: true,
          deletedById: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
        }),
      }).omit({
        createdById: true,
        updatedById: true,
        deletedById: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      }),
    }),
  ),
})

export const GetCartResSchema = z.object({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number(),
  page: z.number(), // No. of current page
  limit: z.number(), // Number of items per page
  totalPages: z.number(), // Total pages
})

export const AddToCartBodySchema = CartItemSchema.pick({
  skuId: true,
  quantity: true,
}).strict()

export const UpdateCartItemBodySchema = AddToCartBodySchema

export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()),
  })
  .strict()

// TYPE EXPORT

export type CartItemType = z.infer<typeof CartItemSchema>

export type GetCartItemParamsType = z.infer<typeof GetCartItemParamsSchema>

export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>

export type GetCartResType = z.infer<typeof GetCartResSchema>

export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>

export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>

export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>
