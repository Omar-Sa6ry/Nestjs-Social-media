import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { PostResponsee } from '../post/dto/postResponse.dto'
import { LikeService } from './like.service'
import { Like } from './entity/like.entity '
import { Comment } from '../comment/entity/comment.entity '

@Resolver(() => Like)
export class LikeResolver {
  constructor (private readonly likeService: LikeService) {}

  // -----------------Post-----------

  @Mutation(() => String)
  @Auth(Role.USER)
  async likePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<string> {
    return this.likeService.likePost(user.id, postId)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unlikePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<string> {
    return this.likeService.unLikePost(user.id, postId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async isPostLiked (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<boolean> {
    return this.likeService.checkIfPostLike(user.id, postId)
  }

  @Query(() => [PostResponsee])
  @Auth(Role.USER)
  async likedUser (
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto: PaginationDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostResponsee[]> {
    return this.likeService.userPostLikes(user.id, paginationDto)
  }

  @Query(() => Int)
  @Auth(Role.USER)
  async postLikeCount (
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<number> {
    return this.likeService.numPostLikes(postId)
  }

  // -------Comment--------

  @Mutation(() => String)
  @Auth(Role.USER)
  async likeComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<string> {
    return this.likeService.likeCommnt(user.id, commentId)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unlikeComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<string> {
    return this.likeService.unLikeComment(user.id, commentId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async hasLikedComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<boolean> {
    return this.likeService.checkIfCommentLike(user.id, commentId)
  }

  @Query(() => [Comment])
  @Auth(Role.USER)
  async getUserLikedComments (
    @CurrentUser() user: CurrentUserDto,
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto?: PaginationDto,
  ): Promise<Comment[]> {
    return this.likeService.userCommentLikes(user.id, paginationDto)
  }

  @Query(() => Int)
  async getCommentLikesCount (
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<number> {
    return this.likeService.numCommentLikes(commentId)
  }
}
