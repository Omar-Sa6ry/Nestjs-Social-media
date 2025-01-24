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

@Resolver(() => Post)
export class PostResolver {
  constructor (
    private readonly postService: PostService,
    private readonly redisService: RedisService,
  ) {}

  @Mutation(() => Post)
  @Auth(Role.USER)
  async createPost (
    @CurrentUser() user: CurrentUserDto,
    @Args('content', { type: () => String, nullable: true }) content: string,
    @Args('images', { type: () => [CreateImagDto], nullable: true })
    images: CreateImagDto[],
  ): Promise<Post> {
    return this.postService.create(user.id, content, images || [])
  }

  @Query(() => Post)
  async getPostById (
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Post> {
    const post = await this.postService.getId(id)

    return post
  }

  @Query(() => [Post])
  async searchPosts (
    @Args('content', { type: () => String }) content: string,
    @Args('pagination', { type: () => PaginationDto, nullable: true })
    paginationDto: PaginationDto,
  ): Promise<Post[]> {
    return this.postService.getContent(content, paginationDto)
  }

  @Query(() => [Post])
  @Auth(Role.USER)
  async getUserPosts (@CurrentUser() user: CurrentUserDto): Promise<Post[]> {
    return this.postService.userPosts(user.id)
  }

  @Mutation(() => Post)
  @Auth(Role.USER)
  async updatePost (
    @CurrentUser() user: CurrentUserDto,
    @Args('id', { type: () => Int }) id: number,
    @Args('content', { type: () => String }) content: string,
  ): Promise<Post> {
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
