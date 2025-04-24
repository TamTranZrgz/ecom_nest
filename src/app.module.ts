import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from './filters/http-exception.filter'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
