import { Module } from '@nestjs/common'
import { MediaController } from './media.controller'
import { MulterModule } from '@nestjs/platform-express'
import multer from 'multer'
import { generateRandomFilename } from 'src/shared/helper'
import { existsSync, mkdirSync } from 'fs'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import { MediaService } from './media.service'

// console.log(UPLOAD_DIR)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    // console.log(file)
    const newFileName = generateRandomFilename(file.originalname)
    cb(null, newFileName)
  },
})

@Module({
  providers: [MediaService],
  imports: [
    MulterModule.register({
      storage,
    }),
  ],
  controllers: [MediaController],
})
export class MediaModule {
  // create upload folder if not exist, this constructor only run one time
  constructor() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, {
        recursive: true,
      })
    }
  }
}
