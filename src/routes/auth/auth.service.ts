import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { RolesService } from './roles.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper'
import { AuthRepository } from './auth.repo'
import { RegisterBodyType, SendOTPBodyType } from './auth.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import envConfig from 'src/shared/config'
import ms from 'ms'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { EmailService } from 'src/shared/services/email.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const vevificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })

      if (!vevificationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Invalid OTP code',
            path: 'code',
          },
        ])
      }

      if (vevificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'Expired OTP code',
            path: 'code',
          },
        ])
      }

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      const user = await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      })
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email is already existed')
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // 1. Check if email exists
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })

    if (user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email exists',
          path: 'email',
        },
      ])
    }

    // 2. Tạo mã OTP
    const expiresInMs = ms(envConfig.OTP_EXPIRES_IN as ms.StringValue)
    if (typeof expiresInMs !== 'number') {
      throw new Error('Invalid OTP_EXPIRES_IN value')
    }

    const code = generateOTP()

    const verificationCode = this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), expiresInMs),
    })

    // 3. Send OTP code to email
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    })

    if (error) {
      throw new UnprocessableEntityException([
        {
          message: 'Send OTP code unsuccessfully',
          path: 'code',
        },
      ])
    }

    return verificationCode
  }

  // async login(body: any) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: {
  //       email: body.email,
  //     },
  //   })

  //   if (!user) {
  //     throw new UnauthorizedException('Account not exists')
  //   }

  //   const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
  //   if (!isPasswordMatch) {
  //     throw new UnprocessableEntityException([
  //       {
  //         field: 'password',
  //         error: 'Password is incorrect',
  //       },
  //     ])
  //   }
  //   const tokens = await this.generateTokens({ userId: user.id })
  //   return tokens
  // }

  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ])
  //   const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: payload.userId,
  //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   })
  //   return { accessToken, refreshToken }
  // }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     // 1. Check refreshToken validity
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
  //     // 2. Check refreshToken availability in db
  //     await this.prismaService.refreshToken.findUniqueOrThrow({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     // 3. Delete old refreshToken in db
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     // 4. Create new accessToken and refreshToken
  //     return await this.generateTokens({ userId })
  //   } catch (error) {
  //     // If refresh token has been evoked, inform user that their refresh token has been revoked
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     throw new UnauthorizedException()
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     // 1. Check refreshToken validity
  //     await this.tokenService.verifyRefreshToken(refreshToken)
  //     // 2. Delete refreshToken in database
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     return { message: 'Logout successfully' }
  //   } catch (error) {
  //     // If refresh token has been evoked, inform user that their refresh token has been revoked
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     throw new UnauthorizedException()
  //   }
  // }
}
