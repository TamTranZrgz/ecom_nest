import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { PaymentApiKeyGuard } from './guards/payment-api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from './guards/authentication.guard'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { EmailService } from './services/email.service'
import { TwoFactorService } from './services/2fa.service'
import { SharedRoleRepository } from './repositories/shared-role.repo'
import { S3Service } from './services/s3.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  SharedUserRepository,
  EmailService,
  TwoFactorService,
  SharedRoleRepository,
  S3Service,
]
@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    PaymentApiKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
  imports: [JwtModule], // use as a module
})
export class SharedModule {}
