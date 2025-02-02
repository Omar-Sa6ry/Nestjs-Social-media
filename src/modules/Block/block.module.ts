import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../users/users.module'
import { User } from '../users/entity/user.entity'
import { BlockService } from './block.service'
import { Block } from './entity/block.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Block, User]), UserModule],
  providers: [BlockService, BlockService],
})
export class BlockModule {}
