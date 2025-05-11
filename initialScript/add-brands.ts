import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()

const addBrands = async () => {
  const brands = Array(10000)
    .fill(0)
    .map((_, index) => ({
      logo: `Logo ${index}`,
      name: `Brand ${index}`, // Add a name property
    }))

  try {
    const { count } = await prisma.brand.createMany({ data: brands })
    console.log(`Add${count} brands`)
  } catch (error) {
    console.error(error)
  }
}

addBrands()
