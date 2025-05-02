import { Module } from '@nestjs/common'
import { RoleController } from './role.controller'
import { RoleService } from './role.service'
import { RoleRepo } from './role.repo'

@Module({
  providers: [RoleService, RoleRepo],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
