import { Module } from '@nestjs/common'
import { UploadService } from './upload.service'
import { TypeOrmModule } from '@nestjs/typeorm'
// import { Images } from '../product/entity/images.entity'

@Module({
  // imports: [TypeOrmModule.forFeature([Images])],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
