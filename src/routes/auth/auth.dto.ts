import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResShema, SendOTPBodySchema, VerificationCodeSchema } from './auth.model'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResShema) {}

export class VerificationCodeDTO extends createZodDto(VerificationCodeSchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
