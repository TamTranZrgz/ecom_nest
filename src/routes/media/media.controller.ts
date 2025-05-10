import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { IsPublic } from 'src/shared/decorator/auth.decorator'
import { Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import { MediaService } from './media.service'
import { ParseFilePipeWithUnlink } from './parse-file-pipe-with-unlink.pipe'
import { ZodSerializerDto } from 'nestjs-zod'
import { PresignedUploadFileBodyDTO, PresignedUploadFileResDTO, UploadFilesResDTO } from './media.dto'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @ZodSerializerDto(UploadFilesResDTO)
  @UseInterceptors(
    FilesInterceptor('files', 100, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          // ... Set of file validator instances here
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 2MB
          // new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    console.log(files)

    // Upload to local
    // return files.map((file) => ({
    //   url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
    // }))

    return this.mediaService.uploadFile(files)
  }

  // Custom guard for static files
  @Get('static/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    // console.log(file)
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        const notFound = new NotFoundException('File not found')
        res.status(notFound.getStatus()).json(notFound.getResponse())
      }
    })
  }

  @Post('images/upload/presigned-url')
  @ZodSerializerDto(PresignedUploadFileResDTO)
  @IsPublic()
  async createdPresignedUrl(@Body() body: PresignedUploadFileBodyDTO) {
    return this.mediaService.getPresignedUrl(body)
  }
}
