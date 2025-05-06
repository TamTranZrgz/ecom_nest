import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RoleType } from 'src/routes/auth/auth.model'

@Injectable()
export class SharedRoleRepository {
  private clientRoleId: number | null = null
  private adminRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  private async getRole(roleName: string) {
    const role: RoleType = await this.prismaService.$queryRaw`
      SELECT * FROM "Role" WHERE "name" = ${roleName} AND "deletedAt" IS NULL LIMIT 1
    `.then((res: RoleType[]) => {
      if (res.length === 0) {
        throw new Error('Customer role not found')
      }
      return res[0]
    })

    return role
  }

  // this function will be called only once, used to catch roleId
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    const role = await this.getRole(RoleName.Customer)

    this.clientRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }

    const role = await this.getRole(RoleName.Admin)

    this.adminRoleId = role.id
    return role.id
  }
}
