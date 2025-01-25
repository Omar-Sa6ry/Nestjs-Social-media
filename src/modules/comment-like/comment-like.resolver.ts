import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { CommentLikeService } from './comment-like.service'
import { Role } from 'src/common/constant/enum.constant'
import { Auth } from 'src/common/decerator/auth.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { Comment } from '../comment/entity/comment.entity '

@Resolver(() => Comment)
export class CommentLikeResolver {
  constructor (private readonly commentLikeService: CommentLikeService) {}

  @Mutation(() => String)
  @Auth(Role.USER)
  async likeComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<string> {
    return this.commentLikeService.like(user.id, commentId)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async unlikeComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<string> {
    return this.commentLikeService.unLike(user.id, commentId)
  }

  @Query(() => Boolean)
  @Auth(Role.USER)
  async hasLikedComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<boolean> {
    return this.commentLikeService.checkIfLike(user.id, commentId)
  }

  @Query(() => [Comment])
  @Auth(Role.USER)
  async getUserLikedComments (
    @CurrentUser() user: CurrentUserDto,
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto?: PaginationDto,
  ): Promise<Comment[]> {
    return this.commentLikeService.userLikes(user.id, paginationDto)
  }

  @Query(() => Int)
  async getCommentLikesCount (
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<number> {
    return this.commentLikeService.numCommentLikes(commentId)
  }
}
