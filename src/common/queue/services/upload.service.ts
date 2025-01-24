import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import * as path from 'path'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { CreateImagDto } from 'src/common/dtos/createImage.dto'
import { Image } from 'src/modules/post/entity/image.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class UploadService {
  constructor (
    @InjectQueue('image') private readonly imageQueue: Queue,
    @InjectRepository(Image) private imageRepository: Repository<Image>,
  ) {}

  async uploadImage (
    createCatInput: CreateImagDto,
    dirUpload: string = 'avatars',
  ): Promise<string> {
    try {
      const { createReadStream, filename } = await createCatInput.image

      const pathFile = Date.now() + '-' + filename
      const uploadDir = path.join(process.cwd(), `./src/images/${dirUpload}`)

      console.log(createReadStream, 'lljiju')
      await this.imageQueue.add('upload-image', {
        createReadStream,
        filename: pathFile,
        uploadDir,
      })

      console.log(`Job added to queue for uploading image: ${pathFile}`)
      return pathFile
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async uploadImages (
    createCatInput: CreateImagDto[],
    postId: number,
  ): Promise<string[]> {
    let images: string[] = []

    const queryRunner =
      this.imageRepository.manager.connection.createQueryRunner()
    await queryRunner.startTransaction()

    try {
      await Promise.all(
        createCatInput.map(async img => {
          const imagePath = await this.uploadImage(img, 'posts')

          if (typeof imagePath === 'string') {
            const image = this.imageRepository.create({
              path: imagePath,
              postId,
            })

            await queryRunner.manager.save(image)
            images.push(imagePath)
          }
        }),
      )

      await queryRunner.commitTransaction()
      return images
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }

    return images
  }
}
