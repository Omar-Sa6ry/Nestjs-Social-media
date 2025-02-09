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
import {
  PostInput,
  PostResponse,
  PostResponsee,
  PostsResponse,
} from './dto/PostResponse.dto'

@Resolver(() => Post)
export class PostResolver {
  constructor (
    private readonly redisService: RedisService,
    private readonly postService: PostService,
  ) {}

  @Mutation(() => PostResponse)
  @Auth(Role.USER)
  async createPost (
    @CurrentUser() user: CurrentUserDto,
    @Args('content', { type: () => String, nullable: true }) content: string,
    @Args('images', { type: () => [CreateImagDto], nullable: true })
    images: CreateImagDto[],
  ): Promise<PostResponse> {
    return {
      data: await this.postService.create(user.id, content, images || []),
    }
  }

  @Query(() => PostResponse)
  async getPostById (
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PostResponse> {
    const postCacheKey = `post:${id}`
    const cachedPost = await this.redisService.get(postCacheKey)
    if (
      cachedPost instanceof PostResponsee ||
      cachedPost instanceof PostInput
    ) {
      return { data: cachedPost }
    }

    return { data: await this.postService.getId(id) }
  }

  @Query(() => PostsResponse)
  async searchPosts (
    @Args('content', { type: () => String, nullable: true }) content: string,
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto: PaginationDto,
  ): Promise<PostsResponse> {
    return { items: await this.postService.getContent(content, paginationDto) }
  }

  @Query(() => PostsResponse)
  @Auth(Role.USER)
  async getUserPosts (
    @CurrentUser() user: CurrentUserDto,
  ): Promise<PostsResponse> {
    return { items: await this.postService.userPosts(user.id) }
  }

  @Mutation(() => PostResponse)
  @Auth(Role.USER)
  async updatePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
    @Args('content', { type: () => String }) content: string,
  ): Promise<PostResponse> {
    return { data: await this.postService.update(user.id, id, content) }
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
