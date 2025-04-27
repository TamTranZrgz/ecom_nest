import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from 'src/shared/config'

@Injectable()
export class TwoFactorService {
  private createTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email, // account identifier
      algorithm: 'SHA1',
      digits: 6, // length of generated tokens
      period: 30, // Interval of time for which a token is valid, in seconds.
      secret: secret || new OTPAuth.Secret(),
    })
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email)
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    }
  }

  verifyTOTP({ email, token, secret }: { email: string; secret: string; token: string }): boolean {
    const totp = this.createTOTP(email, secret)
    const delta = totp.validate({ token, window: 1 })

    // when token is incorrect, delta will be null
    return delta !== null
  }
}

// const twoFactorService = new TwoFactorService()
// console.log(
//   twoFactorService.verifyTOTP({
//     email: 'test.zrzgz@gmail',
//     token: '420014',
//     secret: 'NP5BQ7CTIUEMCZ3QFZT62Y6ZZXBQSJOK',
//   }),
// )
