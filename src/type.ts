/* eslint-disable @typescript-eslint/no-namespace */
import { VariantsType } from 'src/shared/models/shared-product.model'
import { ProductTranslationType } from './shared/models/sahred-product-translation.model'

declare global {
  namespace PrismaJson {
    // Define your custom types here!
    type Variants = VariantsType
    type ProductTranslations = Pick<ProductTranslationType, 'id' | 'name' | 'description' | 'languageId'>[]
    type Receiver = {
      name: string
      phone: string
      address: string
    }
  }
}
