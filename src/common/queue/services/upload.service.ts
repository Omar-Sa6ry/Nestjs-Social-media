import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import * as path from 'path'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { CreateImagDto } from 'src/common/dtos/createImage.dto'

@Injectable()
export class UploadService {
  constructor (@InjectQueue('image') private readonly imageQueue: Queue) {}

  async uploadImage (
    createCatInput: CreateImagDto,
    dirUpload: string = 'avatars',
  ): Promise<string> {
    try {
      const { createReadStream, filename } = await createCatInput.image

      const pathFile = Date.now() + filename
      const uploadDir = path.join(process.cwd(), `./src/images/${dirUpload}`)

      await this.imageQueue.add('upload-image', {
        createReadStream: createReadStream.toString(), // Streams cannot be serialized directly; handle this in the worker
        filename: pathFile,
        uploadDir,
      })

      console.log(`Job added to queue for uploading image: ${pathFile}`)
      return pathFile
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // async uploadImages (
  //   createCatInput: CreateImagDto[],
  //   productId: number,
  // ): Promise<string[]> {
  //   let images: string[] = []

  //   const queryRunner =
  //     this.imageRepository.manager.connection.createQueryRunner()
  //   await queryRunner.startTransaction()

  //   try {
  //     await Promise.all(
  //       createCatInput.map(async img => {
  //         const imagePath = await this.uploadImage(img, 'products')

  //         if (typeof imagePath === 'string') {
  //           const image = this.imageRepository.create({
  //             path: imagePath,
  //             productId,
  //           })

  //           await queryRunner.manager.save(image)
  //           images.push(imagePath)
  //         }
  //       }),
  //     )

  //     await queryRunner.commitTransaction()
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction()
  //     throw error // Rethrow the error to handle it outside
  //   } finally {
  //     await queryRunner.release()
  //   }

  //   return images
  // }
}
