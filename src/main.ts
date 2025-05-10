import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { UPLOAD_DIR } from './shared/constants/other.constant'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors() // Allow all origins for development
  // app.useStaticAssets(UPLOAD_DIR, {
  //   prefix: '/media/static',
  // }) => this will make file image public to all entities
  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
