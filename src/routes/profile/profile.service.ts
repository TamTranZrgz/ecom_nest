import { Injectable } from '@nestjs/common'
import { InvalidPasswordException, NotFoundRecordException } from 'src/shared/error'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { UpdateMeBodyDTO } from './profile.dto'
import { isUniqueConstraintPrismaError } from 'src/shared/helper'
import { ChangePasswordBodyType } from './profile.model'

@Injectable()
export class ProfileService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id: userId,
    })

    if (!user) {
      throw NotFoundRecordException
    }

    return user
  }

  async updateProfile({ body, userId }: { body: UpdateMeBodyDTO; userId: number }) {
    try {
      return await this.sharedUserRepository.update({ id: userId }, { ...body, updatedById: userId })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async changePassword({ userId, body }: { userId: number; body: Omit<ChangePasswordBodyType, 'confirmNewPassword'> }) {
    try {
      const { password, newPassword } = body
      const user = await this.sharedUserRepository.findUnique({ id: userId })

      if (!user) {
        throw NotFoundRecordException
      }

      const isPasswordMatch = await this.hashingService.compare(password, user.password)
      if (!isPasswordMatch) {
        throw InvalidPasswordException
      }

      const hashedPassword = await this.hashingService.hash(newPassword)

      await this.sharedUserRepository.update(
        { id: userId },
        {
          password: hashedPassword,
          updatedById: userId,
        },
      )

      return {
        message: 'Password changed successfully',
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
