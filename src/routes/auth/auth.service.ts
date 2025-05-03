import { HttpException, Injectable } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { RolesService } from './roles.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helper'
import { AuthRepository } from './auth.repo'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './auth.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import envConfig from 'src/shared/config'
import ms from 'ms'
import { EmailService } from 'src/shared/services/email.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidTOTPAndCodeException,
  InvalidTOTPException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnabledException,
  TOTPNotEnabledException,
  UnauthorizedAccessException,
} from './auth.error'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { TwoFactorService } from 'src/shared/services/2fa.service'
import { InvalidPasswordException } from 'src/shared/error'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeOfVerificationCodeType
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_code_type: {
        email,
        code,
        type,
      },
    })

    if (!verificationCode) {
      // throw new UnprocessableEntityException([
      //   {
      //     message: 'Invalid OTP code',
      //     path: 'code',
      //   },
      // ])
      throw InvalidOTPException
    }

    if (verificationCode.expiresAt < new Date()) {
      // throw new UnprocessableEntityException([
      //   {
      //     message: 'Expired OTP code',
      //     path: 'code',
      //   },
      // ])
      throw OTPExpiredException
    }

    return verificationCode
  }

  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })

      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.FORGOT_PASSWORD,
          },
        }),
      ])

      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        // throw new UnprocessableEntityException([
        //   {
        //     message: 'Email exists',
        //     path: 'email',
        //   },
        // ])
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    console.log('sendOTP body', body.type)
    // 1. Check if email exists in db
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
      deletedAt: null,
    })

    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      // throw new UnprocessableEntityException([
      //   {
      //     message: 'Email exists',
      //     path: 'email',
      //   },
      // ])
      throw EmailAlreadyExistsException
    }

    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException
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
      updatedAt: new Date(),
    })

    // 3. Send OTP code to email
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    })

    if (error) {
      // throw new UnprocessableEntityException([
      //   {
      //     message: 'Send OTP code unsuccessfully',
      //     path: 'code',
      //   },
      // ])
      throw FailedToSendOTPException
    }

    return verificationCode
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    // 1. Get user info, check availability, and password
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
      deletedAt: null,
    })

    if (!user) {
      // throw new UnprocessableEntityException([
      //   {
      //     message: 'Email not found',
      //     path: 'email',
      //   },
      // ])
      throw EmailNotFoundException
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      // throw new UnprocessableEntityException([
      //   {
      //     field: 'password',
      //     error: 'Password is incorrect',
      //   },
      // ])
      throw InvalidPasswordException
    }

    // 2. If user has turned on 2FA, check 2fa TOTP code or OTP code (through email)
    if (user.totpSecret) {
      // If no OTP code and TOTP code, throw error
      if (!body.totpCode && !body.code) {
        throw InvalidTOTPAndCodeException
      }

      // CHeck if TOTP code is correct
      if (body.totpCode) {
        const isValid = this.twoFactorService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: body.totpCode,
        })

        if (!isValid) {
          throw InvalidTOTPException
        }
      } else if (body.code) {
        // Check OTP Valididy
        await this.validateVerificationCode({
          email: user.email,
          code: body.code,
          type: TypeOfVerificationCode.LOGIN,
        })
      }
    }

    // 3. Create new device
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    // 4. Create new access and refresh token
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.role.id,
      roleName: user.role.name,
    })

    return tokens
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Check refreshToken validity
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Check refreshToken availability in db
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({ token: refreshToken })

      if (!refreshTokenInDb) {
        // throw new UnauthorizedException('Refresh token has been revoked')
        throw RefreshTokenAlreadyUsedException
      }

      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb

      // 3. Update device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      })

      // 4. Delete old refreshToken in db
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      // 5. Create new accessToken and refreshToken
      const $tokens = this.generateTokens({ userId, roleId, roleName, deviceId })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])

      return tokens
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      // throw new UnauthorizedException()
      throw UnauthorizedAccessException
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Check refreshToken validity
      await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Delete refreshToken in database, catch error if refreshToken not found
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      // 3. Update device status as inactive, catch error if device not found
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, { isActive: false })

      return { message: 'Logout successfully' }
    } catch (error) {
      // If refresh token has been evoked, inform user that their refresh token has been revoked
      if (isNotFoundPrismaError(error)) {
        // throw new UnauthorizedException('Refresh token has been revoked')
        throw RefreshTokenAlreadyUsedException
      }
      // throw new UnauthorizedException()
      throw UnauthorizedAccessException
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body

    // 1. Check email exists in db, catch error if email not found
    const user = await this.sharedUserRepository.findUnique({
      email,
      deletedAt: null,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    // 2. Check OTP code validity
    await this.validateVerificationCode({
      email: body.email,
      code: body.code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    })

    // 3. Update with new password & Delete OTP code
    const hashedPassword = await this.hashingService.hash(newPassword)
    await Promise.all([
      this.sharedUserRepository.update(
        {
          id: user.id,
          deletedAt: null,
        },
        {
          password: hashedPassword,
          updatedById: user.id,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ])

    return {
      message: 'Change password successfully',
    }
  }

  async setupTwoFactorAuth(userId: number) {
    // 1. Get user info to check user availability and check 2FA status
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
      deletedAt: null,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException
    }

    // 2. Create secret and uri
    const { secret, uri } = this.twoFactorService.generateTOTPSecret(user.email)

    // 3. Update secret for user info in db
    await this.sharedUserRepository.update(
      {
        id: userId,
        deletedAt: null,
      },
      {
        totpSecret: secret,
        updatedById: userId,
      },
    )

    // 4. Return secret and uri
    return { secret, uri }
  }

  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { userId, totpCode, code } = data

    // 1. Get user info to check user availability and check 2FA status
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
      deletedAt: null,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    if (!user.totpSecret) {
      throw TOTPNotEnabledException
    }

    // 2. Check OTP code validity
    if (totpCode) {
      const isValid = this.twoFactorService.verifyTOTP({
        email: user.email,
        secret: user.totpSecret,
        token: totpCode,
      })
      if (!isValid) {
        throw InvalidTOTPException
      }
    } else if (code) {
      // 3. Check OTP email validity
      await this.validateVerificationCode({
        email: user.email,
        code,
        type: TypeOfVerificationCode.DISABLE_2FA,
      })
    }

    // 4. Update secret to null
    // await this.authRepository.updateUser({ id: userId }, { totpSecret: null })
    await this.sharedUserRepository.update(
      {
        id: userId,
        deletedAt: null,
      },
      {
        totpSecret: null,
        updatedById: userId,
      },
    )

    // 5. Return successfull message
    return {
      message: 'Turn off 2FA successfully',
    }
  }
}
