import { CreateImagDto } from './dtos/createImage.dto'
import { InjectRepository } from '@nestjs/typeorm'
// import { Images } from '../product/entity/images.entity'
import { Repository } from 'typeorm'
import * as path from 'path'
import * as fs from 'fs'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

@Injectable()
export class UploadService {
  constructor (
    // @InjectRepository(Images) private imageRepository: Repository<Images>,
  ) {}

  async uploadImage (
    createCatInput: CreateImagDto,
    dirUpload: string = 'avatars',
  ): Promise<String> {
    try {
      const { createReadStream, filename } = await createCatInput.image

      const pathFile = Date.now() + filename
      const uploadDir = path.join(process.cwd(), `./src/images/${dirUpload}`)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      await new Promise((resolve, reject) => {
        createReadStream()
          .pipe(fs.createWriteStream(path.join(uploadDir, pathFile)))
          .on('finish', resolve)
          .on('error', err => {
            reject(
              new HttpException('Could not save image', HttpStatus.BAD_REQUEST),
            )
          })
      })

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
