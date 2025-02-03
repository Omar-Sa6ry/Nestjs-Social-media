import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateImagDto } from 'src/common/dtos/createImage.dto'
import { UploadApiResponse } from 'cloudinary'
import { Image } from '../../modules/post/entity/image.entity'
import { ConfigService } from '@nestjs/config'
import { configureCloudinary } from 'src/common/config/cloudinary'
import { v2 as cloudinary } from 'cloudinary'

@Injectable()
export class UploadService {
  constructor (
    private configService: ConfigService,
    @InjectRepository(Image) private imageRepository: Repository<Image>,
  ) {
    configureCloudinary(this.configService)
  }

  async uploadImage (
    createImageInput: CreateImagDto,
    dirUpload: string = 'avatars',
  ): Promise<string> {
    try {
      const { createReadStream, filename } = await createImageInput.image

      if (!createReadStream || typeof createReadStream !== 'function') {
        throw new HttpException('Invalid file input', HttpStatus.BAD_REQUEST)
      }

      const stream = createReadStream()

      console.log('Uploading image...')

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: dirUpload,
            public_id: `${Date.now()}-${filename}`,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Error:', error)
              reject(
                new HttpException(
                  'Image upload failed',
                  HttpStatus.BAD_REQUEST,
                ),
              )
            } else {
              resolve(result)
            }
          },
        )

        stream.pipe(uploadStream)
      })

      if (!result || !result.secure_url) {
        throw new HttpException(
          'Cloudinary response invalid',
          HttpStatus.BAD_REQUEST,
        )
      }

      console.log('Upload successful:', result.secure_url)
      return result.secure_url
    } catch (error) {
      console.error('Upload Error:', error)
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async uploadImages (
    createImageInput: CreateImagDto[],
    postId: number,
  ): Promise<string[]> {
    let images: string[] = []

    const queryRunner =
      this.imageRepository.manager.connection.createQueryRunner()
    await queryRunner.startTransaction()

    try {
      await Promise.all(
        createImageInput.map(async img => {
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
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error // Rethrow the error to handle it outside
    } finally {
      await queryRunner.release()
    }

    return images
  }

  async deleteImageByPath (imagePath: string): Promise<boolean> {
    const image = await this.imageRepository.findOne({
      where: { path: imagePath },
    })

    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND)
    }

    const publicId = image.path.split('/').pop()?.split('.')[0]

    try {
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }

      await this.imageRepository.delete({ path: imagePath })

      console.log(`Deleted image with path ${imagePath} successfully`)
      return true
    } catch (error) {
      console.error('Cloudinary Delete Error:', error)
      throw new HttpException(
        'Failed to delete image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async deleteImagesByPostId (postId: number): Promise<boolean> {
    const images = await this.imageRepository.find({
      where: { postId },
    })

    if (images.length === 0) {
      throw new HttpException(
        'No images found for this post',
        HttpStatus.NOT_FOUND,
      )
    }

    try {
      await Promise.all(
        images.map(async image => {
          const publicId = image.path.split('/').pop()?.split('.')[0]

          if (publicId) {
            await cloudinary.uploader.destroy(publicId)
          }
        }),
      )

      await this.imageRepository.delete({ postId })

      console.log(`Deleted all images for post ${postId} successfully`)
      return true
    } catch (error) {
      console.error('Cloudinary Delete Error:', error)
      throw new HttpException(
        'Failed to delete images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
