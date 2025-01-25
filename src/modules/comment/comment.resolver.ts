import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { CommentService } from './comment.service'
import { CommentResponsee } from './dto/CommentResponse.dto'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { User } from '../users/entity/user.entity'
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { Post } from '../post/entity/post.entity '

@Resolver(() => CommentResponsee)
export class CommentResolver {
  constructor (private readonly commentService: CommentService) {}

  @Mutation(() => CommentResponsee)
  @Auth(Role.USER)
  async writeComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
    @Args('content', { type: () => String }) content: string,
  ): Promise<CommentResponsee> {
    return this.commentService.write(user.id, postId, content)
  }

  @Query(() => CommentResponsee)
  @Auth(Role.USER)
  async getComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
    @Args('content', { type: () => String }) content: string,
  ): Promise<CommentResponsee> {
    return this.commentService.get(user.id, postId, content)
  }

  @Query(() => [CommentResponsee])
  @Auth(Role.USER)
  async getCommentsForPost (
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<CommentResponsee[]> {
    return this.commentService.getCommentPost(postId)
  }

  @Query(() => Int)
  @Auth(Role.USER)
  async getCountCommentPost (
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<number> {
    return this.commentService.getCountCommentPost(postId)
  }

  @Query(() => [CommentResponsee])
  @Auth(Role.USER)
  async getCommentsByUserOnPost (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
  ): Promise<CommentResponsee[]> {
    return this.commentService.getCommentUserOnPost(user.id, postId)
  }

  @Query(() => [CommentResponsee])
  @Auth(Role.USER)
  async getCommentsByUser (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CommentResponsee[]> {
    return this.commentService.getCommentUser(user.id)
  }

  @Query(() => [CommentResponsee])
  @Auth(Role.USER)
  async getLastComments (
    @CurrentUser() user: CurrentUserDto,
    @Args('postId', { type: () => Int }) postId: number,
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto?: PaginationDto,
  ): Promise<CommentResponsee[]> {
    return this.commentService.getLastComment(user.id, postId, paginationDto)
  }

  @Query(() => User)
  @Auth(Role.USER)
  async getUserByComment (
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<User> {
    return this.commentService.getUserByComment(commentId)
  }

  @Query(() => Post)
  @Auth(Role.USER)
  async getPostByComment (
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<Post> {
    return this.commentService.getPostByComment(commentId)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async updateComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
    @Args('content', { type: () => String }) content: string,
  ): Promise<string> {
    return this.commentService.update(user.id, commentId, content)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deleteComment (
    @CurrentUser() user: CurrentUserDto,
    @Args('commentId', { type: () => Int }) commentId: number,
  ): Promise<string> {
    return this.commentService.delete(user.id, commentId)
  }
}
