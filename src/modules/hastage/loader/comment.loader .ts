import * as DataLoader from 'dataloader'
import { Injectable, Scope } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from 'src/modules/comment/entity/comment.entity '

@Injectable({ scope: Scope.REQUEST }) // to be new
export class CommentLoader {
  constructor (
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
  ) {}

  public readonly batchComments = new DataLoader<number, Comment>(
    async (commentIds: number[]) => {
      const comments = await this.commentRepository.findBy({ id: +commentIds })
      const commentMap = new Map(comments.map(comment => [comment.id, comment]))
      return commentIds.map(id => commentMap.get(id) || null)
    },
  )
}
