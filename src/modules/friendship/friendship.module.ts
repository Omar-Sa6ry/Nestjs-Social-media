import { Module } from '@nestjs/common';
import { FriendshipResolver } from './friendship.resolver';
import { FriendshipService } from './friendship.service';

@Module({
  providers: [FriendshipResolver, FriendshipService]
})
export class FriendshipModule {}
