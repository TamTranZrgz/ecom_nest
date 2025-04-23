import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null

  constructor(private readonly prismaService: PrismaService) {}

  // this function will be called only once, used to catch roleId
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.prismaService.role.findUniqueOrThrow({
      where: {
        name: RoleName.Seller,
      },
    })
    this.clientRoleId = role.id
    return role.id
  }
}
