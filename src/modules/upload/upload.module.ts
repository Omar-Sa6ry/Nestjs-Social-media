import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UploadService } from './upload.service'
import { Image } from '../post/entity/image.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
