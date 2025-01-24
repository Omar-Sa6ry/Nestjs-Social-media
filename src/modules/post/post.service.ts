import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateImagDto } from 'src/common/dtos/createImage.dto'
import { Image } from './entity/image.entity'
import { UploadService } from 'src/common/queue/services/upload.service'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { Post } from './entity/post.entity '
import { Repository } from 'typeorm'
import { UserService } from '../users/users.service'
import { RedisService } from 'src/common/redis/redis.service'
import {
  DeletePost,
  EnterContentOrImage,
  ImageLength,
  NoPosts,
  NotPostYou,
  PostNotFound,
  PostsNotFound,
} from 'src/common/constant/messages.constant'

@Injectable()
export class PostService {
  constructor (
    private usersService: UserService,
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
    @InjectRepository(Image) private imageRepository: Repository<Image>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create (
    userId: number,
    content: string,
    createImageDto: CreateImagDto[],
  ): Promise<Post> {
    if (!content && createImageDto.length === 0) {
      throw new BadRequestException(EnterContentOrImage)
    }

    if (createImageDto.length > 5) {
      throw new BadRequestException(ImageLength)
    }

    const post = await this.postRepository.create({ content, userId })
    await this.postRepository.save(post)

    if (createImageDto.length !== 0) {
      const images = await this.uploadService.uploadImages(
        createImageDto,
        post.id,
      )
      console.log(images)
    }

    const relationCacheKey = `post:${post.id}`
    await this.redisService.set(relationCacheKey, post)
    return post
  }

  async getId (id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const relationCacheKey = `posts:${id}`
    await this.redisService.set(relationCacheKey, post)
    return post
  }

  async getContent (content: string, paginationDto: PaginationDto) {
    let posts = await this.postRepository.find({
      order: { createdAt: 'DESC' },
    })
    posts.filter(post => post.content.includes(content))

    if (posts.length === 0) {
      throw new NotFoundException(PostsNotFound)
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        posts = posts.slice(offset || 0, limit + (offset || 0))
      }
    }

    return posts
  }

  async userPosts (userId: number): Promise<Post[]> {
    const posts = await this.postRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    })

    if (posts.length === 0) {
      throw new NotFoundException(NoPosts)
    }

    const relationCacheKey = `posts:${userId}`
    await this.redisService.set(relationCacheKey, posts)
    return posts
  }

  async update (userId: number, id: number, content: string): Promise<Post> {
    if (!content) {
      throw new BadRequestException(EnterContentOrImage)
    }

    const post = await this.postRepository.findOne({ where: { id, userId } })
    if (content) {
      post.content = content
    }
    await this.postRepository.save(post)
    const relationCacheKey = `post:${post.id}`
    await this.redisService.set(relationCacheKey, post)
    return post
  }

  async delete (userId: number, id: number): Promise<string> {
    const post = await this.postRepository.findOne({
      where: { id },
    })
    if (!post) {
      throw new BadRequestException(NoPosts)
    }
    if (userId !== post.userId) {
      throw new BadRequestException(NotPostYou)
    }
    await this.postRepository.remove(post)
    return DeletePost
  }
}
