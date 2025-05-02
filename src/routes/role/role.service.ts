import { Injectable } from '@nestjs/common'
import { RoleRepo } from './role.repo'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './role.model'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper'
import { RoleAlreadyExistsException } from './role.error'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepo) {}

  async list(pagination: GetRolesQueryType) {
    const data = await this.roleRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw NotFoundRecordException
    }
    return role
  }

  async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
    try {
      const role = await this.roleRepo.create({ data, createdById })
      return role
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async update({ data, id, updatedById }: { data: UpdateRoleBodyType; id: number; updatedById: number }) {
    try {
      const role = await this.roleRepo.update({ data, id, updatedById })
      return role
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.roleRepo.delete({ id, deletedById })
      return {
        message: 'Delete role successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
