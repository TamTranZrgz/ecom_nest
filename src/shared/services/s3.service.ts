import { PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import envConfig from '../config'
import { Upload } from '@aws-sdk/lib-storage'
import { readFileSync } from 'fs'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import mime from 'mime-types'

@Injectable()
export class S3Service {
  private s3: S3
  constructor() {
    // initialize a bucket S3
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_KEY,
      },
    })

    // this.s3.listBuckets({}).then((res) => {
    //   console.log(res)
    // })
  }

  uploadedFile({ filename, filepath, contentType }: { filename: string; filepath: string; contentType: string }) {
    const parallelUploads3 = new Upload({
      client: this.s3,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key: filename,
        Body: readFileSync(filepath),
        ContentType: contentType,
      },
      tags: [],
      queueSize: 4,
      partSize: 1024 * 1024 * 5, // (optional) size of each part, in bytes, at least 5MB
      leavePartsOnError: false,
    })

    // parallelUploads3.on('httpUploadProgress', (progress) => {
    //   console.log(progress)
    // }) => download file

    return parallelUploads3.done()
  }

  createPresignedUrlWithClient(filename: string) {
    const contentType = mime.lookup(filename) || 'application/octet-stream'
    const command = new PutObjectCommand({ Bucket: envConfig.S3_BUCKET_NAME, Key: filename, ContentType: contentType })
    return getSignedUrl(this.s3, command, { expiresIn: 10 })
  }
}

// const s3Instance = new S3Service()
// s3Instance
//   .uploadedFile({
//     filename: 'images/test.jpg',
//     filepath: 'D:/Workspace/NestJs/project/ecom/upload/3e3a73c3-7590-4269-80e9-09aed3790577.jpg',
//     contentType: 'image/jpg',
//   })
//   .then(console.log)
//   .catch(console.error)
