import { Injectable } from '@nestjs/common'
import { PermissionRepo } from './permission.repo'
import { NotFoundRecordException } from 'src/shared/error'
import { CreatePermissionBodyType, GetPermissionQueryType, UpdatePermissionBodyType } from './permission.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper'
import { PermissionAlreadyExistsException } from './permission.error'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepo) {}
  async list(pagination: GetPermissionQueryType) {
    const data = await this.permissionRepo.list(pagination)
    return data
  }

  async findById(id: number) {
    const Permission = await this.permissionRepo.findById(id)

    if (!Permission) {
      throw NotFoundRecordException
    }
    return Permission
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepo.create({ createdById, data })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async update({ data, id, updatedById }: { data: UpdatePermissionBodyType; id: number; updatedById: number }) {
    try {
      const Permission = await this.permissionRepo.update({ data, id, updatedById })
      return Permission
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }

      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.permissionRepo.delete({ id, deletedById })
      return {
        message: 'Delete permission successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }
}
