import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { PostService } from './post.service'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { CreateImagDto } from 'src/common/dtos/createImage.dto'
import { Post } from './entity/post.entity '
import { Auth } from 'src/common/decerator/auth.decerator'
import { Role } from 'src/common/constant/enum.constant'
import { CurrentUser } from 'src/common/decerator/currentUser.decerator'
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto'
import { RedisService } from 'src/common/redis/redis.service'
import { PostResponse, PostResponsee } from './dto/PostResponse.dto'

@Resolver(() => Post)
export class PostResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly postService: PostService,
  ) {}

  @Mutation(() => PostResponsee)
  @Auth(Role.USER)
  async createPost (
    @CurrentUser() user: CurrentUserDto,
    @Args('content', { type: () => String, nullable: true }) content: string,
    @Args('images', { type: () => [CreateImagDto], nullable: true })
    images: CreateImagDto[],
  ): Promise<PostResponsee> {
    return this.postService.create(user.id, content, images || [])
  }

  @Query(() => PostResponsee)
  async getPostById (
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PostResponsee> {
    const postCacheKey = `post:${id}`
    const cachedPost = await this.redisService.get(postCacheKey)
    if (
      cachedPost instanceof PostResponsee ||
      cachedPost instanceof PostResponse
    ) {
      return cachedPost
    }

    return await this.postService.getId(id)
  }

  @Query(() => [PostResponsee])
  async searchPosts (
    @Args('content', { type: () => String }) content: string,
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto: PaginationDto,
  ): Promise<PostResponsee[]> {
    return this.postService.getContent(content, paginationDto)
  }

  @Query(() => [PostResponsee])
  @Auth(Role.USER)
  async getUserPosts (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostResponsee[]> {
    return this.postService.userPosts(user.id)
  }

  @Mutation(() => PostResponsee)
  @Auth(Role.USER)
  async updatePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
    @Args('content', { type: () => String }) content: string,
  ): Promise<PostResponsee> {
    return this.postService.update(user.id, id, content)
  }

  @Mutation(() => String)
  @Auth(Role.USER)
  async deletePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<string> {
    return this.postService.delete(user.id, id)
  }
}
