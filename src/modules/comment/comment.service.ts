import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Comment } from './entity/comment.entity '
import { User } from '../users/entity/user.entity'
import { CommentResponse } from './dto/commentResponse.dto'
import { PaginationDto } from 'src/common/dtos/pagination.dto'
import { Post } from '../post/entity/post.entity '
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
  CommentNotFound,
  CommentsNotFound,
  DeleteComment,
  PostNotFound,
  UpdateComment,
} from 'src/common/constant/messages.constant'

@Injectable()
export class CommentService {
  constructor (
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async write (
    userId: number,
    postId: number,
    content: string,
  ): Promise<CommentResponse> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const comment = await this.commentRepository.create({
      userId,
      content,
      postId,
    })
    await this.commentRepository.save(comment)

    const user = await this.userRepository.findOne({
      where: { id: comment.userId },
    })

    const result = {
      id: comment.id,
      content,
      post,
      user,
      createdAt: comment.createdAt,
    }
    return result
  }

  async get (
    userId: number,
    postId: number,
    content: string,
  ): Promise<CommentResponse> {
    const comment = await this.commentRepository.findOne({
      where: {
        userId,
        content,
        postId,
      },
    })

    if (!comment) {
      throw new BadRequestException(CommentNotFound)
    }

    const post = await this.postRepository.findOne({
      where: { id: comment.postId },
    })
    const user = await this.userRepository.findOne({
      where: { id: comment.userId },
    })

    const result = {
      id: comment.id,
      content,
      post,
      user,
      createdAt: comment.createdAt,
    }
    return result
  }

  async getCommentPost (postId: number): Promise<CommentResponse[]> {
    const comments = await this.commentRepository.find({
      where: {
        postId,
      },
    })

    if (comments.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }

    const result = []
    for (const comment of comments) {
      const post = await this.postRepository.findOne({
        where: { id: comment.postId },
      })
      const user = await this.userRepository.findOne({
        where: { id: comment.userId },
      })

      result.push({
        id: comment.id,
        content: comment.content,
        post,
        user,
        createdAt: comment.createdAt,
      })
    }
    return result
  }

  async getCountCommentPost (postId: number): Promise<number> {
    const comments = await this.commentRepository.find({
      where: {
        postId,
      },
    })

    if (comments.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }
    return comments.length
  }

  async getCommentUserOnPost (
    userId: number,
    postId: number,
  ): Promise<CommentResponse[]> {
    const comments = await this.commentRepository.find({
      where: {
        userId,
        postId,
      },
    })

    if (comments.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }

    const result = []
    for (const comment of comments) {
      const post = await this.postRepository.findOne({
        where: { id: comment.postId },
      })
      const user = await this.userRepository.findOne({
        where: { id: comment.userId },
      })

      result.push({
        id: comment.id,
        content: comment.content,
        post,
        user,
        createdAt: comment.createdAt,
      })
    }
    return result
  }

  async getCommentUser (userId: number): Promise<CommentResponse[]> {
    const comments = await this.commentRepository.find({
      where: {
        userId,
      },
    })

    if (comments.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }

    const result = []
    for (const comment of comments) {
      const post = await this.postRepository.findOne({
        where: { id: comment.postId },
      })
      const user = await this.userRepository.findOne({
        where: { id: comment.userId },
      })

      result.push({
        id: comment.id,
        content: comment.content,
        post,
        user,
        createdAt: comment.createdAt,
      })
    }
    return result
  }

  async getLastComment (
    userId: number,
    postId: number,
    paginationDto?: PaginationDto,
  ): Promise<CommentResponse[]> {
    let comments = await this.commentRepository.find({
      where: {
        userId,
        postId,
      },
    })

    if (comments.length === 0) {
      throw new BadRequestException(CommentsNotFound)
    }

    if (paginationDto) {
      const { limit, offset } = paginationDto
      if (limit !== undefined) {
        comments = comments.slice(offset || 0, limit + (offset || 0))
      }
    }

    const result = []
    for (const comment of comments) {
      const post = await this.postRepository.findOne({
        where: { id: comment.postId },
      })
      const user = await this.userRepository.findOne({
        where: { id: comment.userId },
      })

      result.push({
        id: comment.id,
        content: comment.content,
        post,
        user,
        createdAt: comment.createdAt,
      })
    }
    return result
  }

  async getUserByComment (id: number): Promise<User> {
    const comment = await this.commentRepository.findOne({ where: { id } })
    if (!comment) {
      throw new BadRequestException(CommentNotFound)
    }

    return await this.userRepository.findOne({ where: { id: comment.userId } })
  }

  async getPostByComment (id: number): Promise<Post> {
    const comment = await this.commentRepository.findOne({ where: { id } })
    if (!comment) {
      throw new BadRequestException(CommentNotFound)
    }

    return await this.postRepository.findOne({ where: { id: comment.postId } })
  }

  async update (userId: number, id: number, content: string): Promise<string> {
    const comment = await this.commentRepository.findOne({
      where: { id, userId },
    })
    if (!comment) {
      throw new BadRequestException(CommentNotFound)
    }

    comment.content = content
    await this.commentRepository.save(comment)
    return UpdateComment
  }

  async delete (userId: number, id: number): Promise<string> {
    const comment = await this.commentRepository.findOne({
      where: { id, userId },
    })
    if (!comment) {
      throw new BadRequestException(CommentNotFound)
    }

    const post = await this.commentRepository.findOne({
      where: { postId: comment.postId },
    })
    if (!post) {
      throw new BadRequestException(PostNotFound)
    }

    await this.commentRepository.remove(comment)
    return DeleteComment
  }
}
