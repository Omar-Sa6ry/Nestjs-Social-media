import { Module } from '@nestjs/common'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { GenerateToken } from '../../common/config/jwt.service'
import { UserModule } from '../users/users.module'
import { User } from '../users/entity/user.entity'
import { QueueModule } from 'src/queue/queue.module'
import { SendEmailService } from 'src/queue/services/sendemail.service'
import { UploadModule } from '../upload/upload.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
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
    GenerateToken,
    JwtService,
  ],
})
export class AuthModule {}
