import { ProductTranslationSchema } from 'src/routes/product/product-translation/product-translation.model'
import { SKUSchema, UpsertSKUBodySchema } from 'src/routes/product/sku.model'
import { BrandIncludeTranslationSchema } from 'src/shared/models/shared-brand.model'
import { CategoryIncludeTranslationSchema } from 'src/shared/models/shared-category.model'
import { z } from 'zod'

function generateSKUs(variants: VariantsType) {
  // Function to create SKUS (all combinations)
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), [''])
  }

  // Get all arrays of options from variants
  const options = variants.map((variant) => variant.options)

  // Create all combinations
  const combinations = getCombinations(options)

  // Convert all combinations to SKU objects
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: '',
  }))
}
export const VariantSchema = z.object({
  value: z.string(),
  options: z.array(z.string()),
})

export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
  // Check variants and variant option for coincidence
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    const isDifferent = variants.findIndex((v) => v.value === variant.value) !== i
    if (!isDifferent) {
      return ctx.addIssue({
        code: 'custom',
        message: `Valor ${variant.value} exists in list of variants. Please check again.`,
        path: ['variants'],
      })
    }
    const isDifferentOption = variant.options.findIndex((o) => variant.options.includes(o)) !== -1
    if (isDifferentOption) {
      return ctx.addIssue({
        code: 'custom',
        message: `Valor ${variant.value} contains options with coincidences. Please check again.`,
        path: ['variants'],
      })
    }
  }
})

export const ProductSchema = z.object({
  id: z.number(),
  publishedAt: z.coerce.date().nullable(),
  name: z.string().max(500),
  basePrice: z.number().positive(),
  virtualPrice: z.number().positive(),
  brandId: z.number().positive(),
  images: z.array(z.string()),
  variants: VariantsSchema, // Json field represented as a record

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  name: z.string().optional(),
  brandIds: z.array(z.coerce.number().int().positive()).optional(),
  categories: z.array(z.coerce.number().int().positive()).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
})

export const GetProductsResSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
  page: z.number(), // Số trang hiện tại
  limit: z.number(), // Số item trên 1 trang
  totalPages: z.number(), // Tổng số trang
})

export const GetProductParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetProductDetailResSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
  brand: BrandIncludeTranslationSchema,
})

export const CreateProductBodySchema = ProductSchema.pick({
  publishedAt: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    //  Check if the number of SKUs is correct
    const skuValueArray = generateSKUs(variants)
    if (skus.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `No. of SKU should be ${skuValueArray.length}. Please check again.`,
      })
    }

    // Check if each SKU is valid
    let wrongSKUIndex = -1
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value
      if (!isValid) {
        wrongSKUIndex = index
      }
      return isValid
    })
    if (!isValidSKUs) {
      ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `Value of SKU index ${wrongSKUIndex} is not valid. Please check again.`,
      })
    }
  })

export const UpdateProductBodySchema = CreateProductBodySchema

// TYPE EXPORT

export type ProductType = z.infer<typeof ProductSchema>

export type VariantsType = z.infer<typeof VariantsSchema>

export type GetProductsResType = z.infer<typeof GetProductsResSchema>

export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>

export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>

export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>

export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>

export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>
