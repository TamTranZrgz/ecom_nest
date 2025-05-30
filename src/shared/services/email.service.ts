import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from 'src/shared/config'
import fs from 'fs'
import path from 'path'

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(payload: { email: string; code: string }) {
    const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), {
      encoding: 'utf-8',
    })

    const subject = 'OTP Code'

    return this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      to: ['thanh.tam.tran.zrgz@gmail.com'],
      subject,
      html: otpTemplate.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code),
    })
  }
}
