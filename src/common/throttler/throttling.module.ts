import { Module } from '@nestjs/common'
import { ThrottlerModule as Throttler } from '@nestjs/throttler'

@Module({
  imports: [
    Throttler.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
})
export class ThrottlerModule {}
