import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { PostLikeService } from './post-like.service'
import { Post } from '../post/entity/post.entity '
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { PostResponsee } from '../post/dto/postResponse.dto'

@Resolver(() => Post)
export class PostLikeResolver {
  constructor (private readonly postLikeService: PostLikeService) {}

  @Mutation(() => String)
  @Auth(Role.USER)
  async likePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<string> {
    return this.postLikeService.like(user.id, postId)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unlikePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<string> {
    return this.postLikeService.unLike(user.id, postId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async isPostLiked (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<boolean> {
    return this.postLikeService.checkIfLike(user.id, postId)
  }

  @Query(() => [PostResponsee])
  @Auth(Role.USER)
  async likedUser (
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto: PaginationDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostResponsee[]> {
    return this.postLikeService.userLikes(user.id, paginationDto)
  }

  @Query(() => Int)
  @Auth(Role.USER)
  async postLikeCount (
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<number> {
    return this.postLikeService.numPostLikes(postId)
  }
}
