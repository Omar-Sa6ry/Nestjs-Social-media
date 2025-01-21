import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { EmailProcessor } from './process/email.processing'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: +process.env.REDIS_PORT || 6379,
      },
    }),
  ],
  providers: [EmailProcessor],
  exports: [BullModule],
})
export class QueueModule {}
