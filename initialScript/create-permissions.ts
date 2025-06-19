import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { HTTPMethod, RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

const SellerModule = ['auth', 'media', 'manage-product', 'product-translations', 'profile', 'cart']
const CustomerModule = ['auth', 'media', 'profile', 'cart', 'orders']
const prisma = new PrismaService()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  const permissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })

  const availableRoutes: { path: string; method: keyof typeof HTTPMethod; name: string; module: string }[] =
    router.stack
      .map((layer) => {
        if (layer.route) {
          const path = layer.route?.path
          const method = String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPMethod
          const moduleName = path.split('/')[1]
          return {
            path,
            method,
            name: method + ' ' + path,
            module: moduleName,
          }
        }
      })
      .filter((item) => item !== undefined)

  // Create permissionsInDbMap object with [method:path] as key
  const permissionsInDbMap: Record<string, (typeof permissionsInDb)[0]> = permissionsInDb.reduce((acc, permission) => {
    acc[`${permission.method}-${permission.path}`] = permission
    return acc
  }, {})

  // Create object availableRoutesMap with [method:path] as key
  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, route) => {
    acc[`${route.method}-${route.path}`] = route
    return acc
  }, {})

  // Find permissions in db which is not avaliable in availableRoutes
  const permissionsToDelete = permissionsInDb.filter((route) => {
    return !availableRoutesMap[`${route.method}-${route.path}`]
  })

  // Delete permission in db which is not avaliable in availableRoutes
  if (permissionsToDelete.length > 0) {
    const deleteResult = await prisma.permission.deleteMany({
      where: {
        id: {
          in: permissionsToDelete.map((permission) => permission.id),
        },
      },
    })
    console.log('Deleted permissions: ', deleteResult.count)
  } else {
    console.log('No permission to delete')
  }

  // Find routes that are not available in permissionsInDb
  const routesToAdd = availableRoutes.filter((route) => {
    return !permissionsInDbMap[`${route.method}-${route.path}`]
  })

  // Add routes as permissions to db
  if (routesToAdd.length > 0) {
    const permissionsToAdd = await prisma.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true,
    })

    console.log('Added permissions: ', permissionsToAdd.count)
  } else {
    console.log('No permission to add')
  }

  // Add permissions to db
  // try {
  //   const result = await prisma.permission.createMany({
  //     data: availableRoutes,
  //     skipDuplicates: true,
  //   })
  //   console.log(result)
  // } catch (error) {
  //   console.log(error)
  // }

  // Retrieve permissons from db after adding/deleting
  const updatedPermissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })

  // console.log(updatedPermissionsInDb)

  const adminPermissionIds = updatedPermissionsInDb.map((permission) => ({
    id: permission.id,
  }))

  const sellerPermissionIds = updatedPermissionsInDb
    .filter((permission) => SellerModule.includes(permission.module))
    .map((permission) => ({
      id: permission.id,
    }))

  const customerPermissionIds = updatedPermissionsInDb
    .filter((permission) => CustomerModule.includes(permission.module))
    .map((permission) => ({
      id: permission.id,
    }))

  // console.log(updatedPermissionsInDb.filter((permission) => SellerModule.includes(permission.module)))

  await Promise.all([
    updateRole(adminPermissionIds, RoleName.Admin),
    updateRole(sellerPermissionIds, RoleName.Seller),
    updateRole(customerPermissionIds, RoleName.Customer),
  ])

  process.exit(0)
}

const updateRole = async (permissionIds: { id: number }[], roleName: string) => {
  // Update permisions for ADMIN role
  const role = await prisma.role.findFirstOrThrow({
    where: {
      name: roleName,
      deletedAt: null,
    },
  })

  await prisma.role.update({
    where: {
      id: role.id,
    },
    data: {
      permissions: {
        set: permissionIds,
      },
    },
  })
}

bootstrap()
