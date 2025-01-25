import { Module } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { GenerateToken } from '../../common/config/jwt.service'
import { UserModule } from '../users/users.module'
import { User } from '../users/entity/user.entity'
import { QueueModule } from 'src/common/queue/queue.module'
import { SendEmailService } from 'src/common/queue/services/sendemail.service'
import { UploadService } from 'src/common/queue/services/upload.service'
import { RedisModule } from 'src/common/redis/redis.module'
import { Image } from '../post/entity/image.entity'
import { UploadModule } from '../upload/upload.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Image]),
    UserModule,
    RedisModule,
    UploadModule,
    QueueModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'huigyufutftydty',
      signOptions: { expiresIn: process.env.JWT_EXPIRE },
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    SendEmailService,
    UploadService,
    GenerateToken,
    JwtService,
  ],
})
export class AuthModule {}
