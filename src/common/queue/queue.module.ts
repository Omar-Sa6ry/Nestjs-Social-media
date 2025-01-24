import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { EmailProcessor } from './process/email.processing'
import { ImageProcessor } from './process/image.processing.'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Image } from 'src/modules/post/entity/image.entity'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({ name: 'email' }, { name: 'image' }),
  TypeOrmModule.forFeature([Image])],
  providers: [EmailProcessor, ImageProcessor],
  exports: [BullModule],
})
export class QueueModule {}
