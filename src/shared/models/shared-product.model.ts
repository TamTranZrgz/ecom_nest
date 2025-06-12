import { z } from 'zod'

export const VariantSchema = z.object({
  value: z.string().trim(),
  options: z.array(z.string().trim()),
})

export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
  // Check variants and variant option for coincidence
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    const isExistingVariant = variants.findIndex((v) => v.value.toLowerCase() === variant.value.toLowerCase()) !== i
    if (isExistingVariant) {
      return ctx.addIssue({
        code: 'custom',
        message: `Valor ${variant.value} exists in list of variants. Please check again.`,
        path: ['variants'],
      })
    }
    // const isDifferentOption = variant.options.findIndex((o) => variant.options.includes(o)) !== -1
    const isDifferentOption = variant.options.some((option, index) => {
      const isExistingOption = variant.options.findIndex((o) => o.toLowerCase() === option.toLowerCase()) !== index
      return isExistingOption
    })

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

  name: z.string().trim().max(500),
  basePrice: z.number().min(0),
  virtualPrice: z.number().min(0),

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

// TYPE EXPORT

export type ProductType = z.infer<typeof ProductSchema>

export type VariantsType = z.infer<typeof VariantsSchema>
