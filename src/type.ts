/* eslint-disable @typescript-eslint/no-namespace */

import { VariantsType } from 'src/shared/models/shared-product.model'

declare global {
  namespace PrismaJson {
    // Define your custom types here!
    type Variants = VariantsType
  }
}
