import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'
import { UPLOAD_DIR } from './shared/constants/other.constant'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors() // Allow all origins for development
  // app.useStaticAssets(UPLOAD_DIR, {
  //   prefix: '/media/static',
  // }) => this will make file image public to all entities

  patchNestJsSwagger()

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('The Ecommerce API description')
    .setVersion('1.0')
    .addBearerAuth()
    // .addTag('cats')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
