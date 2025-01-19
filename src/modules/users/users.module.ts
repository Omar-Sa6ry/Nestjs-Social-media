import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entity/user.entity'
import { UserService } from './users.service'
import { UserResolver } from './users.resolver'
import { UploadModule } from '../upload/upload.module'
// import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [TypeOrmModule.forFeature([User]), UploadModule,],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
