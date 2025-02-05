import * as DataLoader from 'dataloader'
import { Injectable, Scope } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Reply } from 'src/modules/reply/entity/reply.entity '

@Injectable({ scope: Scope.REQUEST })
export class ReplyLoader {
  constructor (
    @InjectRepository(Reply) private readonly replyRepository: Repository<Reply>,
  ) {}

  public readonly batchReplys = new DataLoader<number, Reply>(
    async (commentsId: number[]) => {
      const replys = await this.replyRepository.findBy({ id: +commentsId })
      const replyMap = new Map(replys.map(reply => [reply.id, reply]))
      return commentsId.map(id => replyMap.get(id) || null)
    },
  )
}
