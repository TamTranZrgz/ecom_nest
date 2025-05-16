/* eslint-disable @typescript-eslint/no-namespace */
import { VariantsType } from './routes/product/product.model'

declare global {
  namespace PrismaJson {
    // Define your custom types here!
    type Variants = VariantsType
  }
}
