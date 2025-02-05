import * as DataLoader from 'dataloader'
import { Injectable, Scope } from '@nestjs/common'
import { Post } from 'src/modules/post/entity/post.entity '
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable({ scope: Scope.REQUEST })
export class PostLoader {
  constructor (
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  public readonly batchPosts = new DataLoader<number, Post>(
    async (postIds: number[]) => {
      const posts = await this.postRepository.findBy({ id: +postIds })
      const postMap = new Map(posts.map(post => [post.id, post]))
      return postIds.map(id => postMap.get(id) || null)
    },
  )
}
