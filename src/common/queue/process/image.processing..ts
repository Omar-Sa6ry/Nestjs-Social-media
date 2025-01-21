import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import * as fs from 'fs'
import * as path from 'path'
import { Injectable, HttpException, HttpStatus } from '@nestjs/common'

@Processor('image')
@Injectable()
export class ImageProcessor extends WorkerHost {
  async process (job: Job): Promise<void> {
    const { createReadStream, filename, uploadDir } = job.data

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      await new Promise((resolve, reject) => {
        fs.writeFile(path.join(uploadDir, filename), createReadStream, err => {
          if (err) {
            reject(
              new HttpException('Could not save image', HttpStatus.BAD_REQUEST),
            )
          }
          resolve(null)
        })
      })

      console.log(`Image uploaded successfully: ${filename}`)
    } catch (error) {
      console.error(`Error processing upload: ${error.message}`)
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
