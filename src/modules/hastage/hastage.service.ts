import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as DataLoader from 'dataloader'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Not, Repository } from 'typeorm'
import { Hashtag } from './entity/hastage.entity'
import {
  CommentNotFound,
  CommentsNotFound,
  DeleteHashtage,
  HashtagExisted,
  HashtagNotFound,
  ImagesNotFound,
  NoHashtage,
  NoHashtages,
  NoPosts,
  PostNotFound,
  UserNameIsWrong,
} from 'src/common/constant/messages.constant'
import { PostHastageResponse } from './dtos/HashtagPostResponse.dto'
import { Post } from '../post/entity/post.entity '
import { User } from '../users/entity/user.entity'
import { Comment } from '../comment/entity/comment.entity '
import { LikeService } from '../like/like.service'
import { Image } from '../post/entity/image.entity'
import {
  createCommentLoader,
  createImageLoader,
  createLikeLoader,
  createUserLoader,
} from 'src/common/loaders/date-loaders'
import { PostLoader } from './loader/post.loader'
import { CommentHastageResponse } from './dtos/HashtagCommentResponse.dto '
import { Reply } from '../reply/entity/reply.entity '
import { ReplyHastageResponse } from './dtos/HashtagReplyResponse.dto  '
import { ReplyLoader } from './loader/reply.loader '
import { CommentLoader } from './loader/comment.loader '

@Injectable()
export class HashtagService {
  private userLoader: DataLoader<number, User>
  private userPostLoader: DataLoader<number, User>
  private likeLoader: DataLoader<number, number>
  private commentLoader: DataLoader<number, Comment[]>
  private imageLoader: DataLoader<number, Image[]>

  constructor (
    private postLoader: PostLoader,
    private commentsLoader: CommentLoader,
    private replyLoader: ReplyLoader,
    private likeService: LikeService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,
  ) {
    this.userLoader = createUserLoader(this.userRepository)
    this.userPostLoader = createUserLoader(this.userRepository)
    this.commentLoader = createCommentLoader(this.commentRepository)
    this.imageLoader = createImageLoader(this.imageRepository)
    this.likeLoader = createLikeLoader(this.likeService)
  }

  // ----------------- Post ---------------------

  async createHastagePost (
    userId: number,
    postId: number,
    content: string,
  ): Promise<PostHastageResponse> {
    const query = this.hashtagRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const post = await this.postRepository.findOne({
        where: { id: postId },
      })
      if (!post) {
        throw new NotFoundException(PostNotFound)
      }

      const existingHashtag = await this.hashtagRepository.findOne({
        where: { content, userId, postId },
      })
      if (existingHashtag) {
        throw new BadRequestException(HashtagExisted)
      }

      const hashtag = this.hashtagRepository.create({ content, userId, postId })

      await this.hashtagRepository.save(hashtag)

      const likes = await this.likeService.numPostLikes(post.id)
      const comments = await this.commentRepository.find({
        where: { postId: post.id },
      })
      const images = (
        await this.imageRepository.find({
          where: { id: post.id },
          select: ['path'],
        })
      ).map(image => image.path)
      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new NotFoundException(PostNotFound)
      }
      const userPost = await this.userRepository.findOne({
        where: { id: post.userId },
      })
      if (!userPost) {
        throw new NotFoundException(PostNotFound)
      }

      return {
        id: hashtag.id,
        content: hashtag.content,
        createdAt: hashtag.createdAt,
        user,
        post: {
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          user: userPost,
          images,
          likes,
          comments,
        },
      }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findPostHashtag (content: string): Promise<PostHastageResponse> {
    const hashtag = await this.hashtagRepository.findOne({
      where: { content },
    })
    if (!hashtag) {
      throw new BadRequestException(HashtagNotFound)
    }

    const post = await this.postRepository.findOne({
      where: { id: hashtag.postId },
    })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const likes = await this.likeService.numPostLikes(post.id)
    const comments = await this.commentRepository.find({
      where: { postId: post.id },
    })
    const images = (
      await this.imageRepository.find({
        where: { id: post.id },
        select: ['path'],
      })
    ).map(image => image.path)

    const user = await this.userRepository.findOne({
      where: { id: hashtag.userId },
    })
    if (!user) {
      throw new NotFoundException(PostNotFound)
    }

    const userPost = await this.userRepository.findOne({
      where: { id: post.userId },
    })
    if (!userPost) {
      throw new NotFoundException(PostNotFound)
    }

    return {
      id: hashtag.id,
      content: hashtag.content,
      createdAt: hashtag.createdAt,
      user,
      post: {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        user: userPost,
        images,
        likes,
        comments,
      },
    }
  }

  async findAllPostHashtag (
    postId: number,
    limit: number,
    skip: number = 0,
  ): Promise<PostHastageResponse[]> {
    const hashtags = await this.hashtagRepository.find({
      where: { postId },
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    })

    if (hashtags.length === 0) {
      throw new BadRequestException(NoHashtages)
    }

    const posts = await this.postLoader.batchPosts.loadMany(
      hashtags.map(h => h.postId),
    )
    const validPosts = posts.filter((c): c is Post => !(c instanceof Error))

    const comments = await this.commentLoader.loadMany(
      validPosts.flat().map(post => post.id),
    )

    const likes = await this.likeLoader.loadMany(
      hashtags.map(post => post.postId),
    )
    const images = await this.imageLoader.loadMany(
      hashtags.map(post => post.postId),
    )

    const users = await this.userLoader.loadMany(
      hashtags.map(hashtage => hashtage.userId),
    )

    return await Promise.all(
      hashtags.map(async (hashtag, index) => {
        const post = posts[index]
        if (!(post instanceof Post)) {
          throw new BadRequestException(NoPosts)
        }

        const postLikes = likes[index]
        if (postLikes instanceof Error) {
          throw new NotFoundException('Error fetching likes')
        }

        const postImages = images[index]
        if (postImages instanceof Error) {
          throw new NotFoundException(ImagesNotFound)
        }
        const imgs: string[] = []
        await postImages.map(i => imgs.push(i.path))

        const comment = comments[index]
        if (comment instanceof Error) {
          throw new BadRequestException(NoPosts)
        }

        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const userPosts = await this.userPostLoader.loadMany(
          hashtags.map(hashtag => hashtag.userId),
        )
        const userPost = userPosts[index]
        if (userPost instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: hashtag.id,
          content: hashtag.content,
          createdAt: hashtag.createdAt,
          user,
          post: {
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            user: userPost,
            images: imgs,
            likes: postLikes,
            comments: comment,
          },
        }
      }),
    )
  }

  async updateHastagePost (
    userId: number,
    id: number,
    postId: number,
    content: string,
  ): Promise<PostHastageResponse> {
    const query = this.hashtagRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const post = await this.postRepository.findOne({ where: { id: postId } })
      if (!post) {
        throw new NotFoundException(PostNotFound)
      }

      const hashtag = await this.hashtagRepository.findOne({
        where: { userId, postId, id },
      })
      if (!hashtag) {
        throw new BadRequestException(NoHashtage)
      }

      hashtag.content = content
      await this.hashtagRepository.save(hashtag)

      const likes = await this.likeService.numPostLikes(post.id)
      const comments = await this.commentRepository.find({
        where: { postId: post.id },
      })
      const images = (
        await this.imageRepository.find({
          where: { id: post.id },
          select: ['path'],
        })
      ).map(image => image.path)
      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new NotFoundException(PostNotFound)
      }
      const userPost = await this.userRepository.findOne({
        where: { id: post.userId },
      })
      if (!userPost) {
        throw new NotFoundException(PostNotFound)
      }

      return {
        id: hashtag.id,
        content: hashtag.content,
        createdAt: hashtag.createdAt,
        user,
        post: {
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          user: userPost,
          images,
          likes,
          comments,
        },
      }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findAllUserHashtagOnPost (
    userId: number,
    limit: number = 10,
    skip: number = 0,
  ): Promise<PostHastageResponse[]> {
    const hashtags = await this.hashtagRepository.find({
      where: { userId, postId: Not(IsNull()) },
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    })

    if (hashtags.length === 0) {
      throw new BadRequestException(NoHashtages)
    }

    const posts = await this.postLoader.batchPosts.loadMany(
      hashtags.map(h => h.postId),
    )
    const validPosts = posts.filter((c): c is Post => !(c instanceof Error))

    const users = await this.userLoader.loadMany(
      hashtags.map(hashtag => hashtag.userId),
    )
    const comments = await this.commentLoader.loadMany(
      validPosts.flat().map(post => post.id),
    )
    const likes = await this.likeLoader.loadMany(
      hashtags.map(post => post.postId),
    )
    const images = await this.imageLoader.loadMany(
      hashtags.map(post => post.postId),
    )

    return await Promise.all(
      hashtags.map(async (hashtag, index) => {
        const post = posts[index]
        if (!(post instanceof Post)) {
          throw new BadRequestException(NoPosts)
        }

        const postLikes = likes[index]
        if (postLikes instanceof Error) {
          throw new NotFoundException('Error fetching likes')
        }

        const postImages = images[index]
        if (postImages instanceof Error) {
          throw new NotFoundException(ImagesNotFound)
        }
        const imgs: string[] = []
        await postImages.map(i => imgs.push(i.path))

        const comment = comments[index]
        if (comment instanceof Error) {
          throw new BadRequestException(NoPosts)
        }

        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const userPosts = await this.userPostLoader.loadMany(
          hashtags.map(hashtag => hashtag.userId),
        )
        const userPost = userPosts[index]
        if (userPost instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: hashtag.id,
          content: hashtag.content,
          createdAt: hashtag.createdAt,
          user: user,
          post: {
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            user: userPost,
            images: imgs,
            likes: postLikes,
            comments: comment,
          },
        }
      }),
    )
  }

  async findAllUserHashtagOnPostCount (userId: number) {
    const count = await this.hashtagRepository.count({
      where: { userId, postId: Not(IsNull()) },
    })

    return count
  }

  // ----------------- Comment ---------------------

  async createHastageComment (
    userId: number,
    commentId: number,
    content: string,
  ): Promise<CommentHastageResponse> {
    const query = this.hashtagRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      })
      if (!comment) {
        throw new NotFoundException(CommentNotFound)
      }

      const existingHashtag = await this.hashtagRepository.findOne({
        where: { content, userId, commentId },
      })
      if (existingHashtag) {
        throw new BadRequestException(HashtagExisted)
      }

      const hashtag = this.hashtagRepository.create({
        content,
        commentId,
        userId,
      })
      await this.hashtagRepository.save(hashtag)

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new NotFoundException(PostNotFound)
      }
      const userComment = await this.userRepository.findOne({
        where: { id: comment.userId },
      })
      if (!userComment) {
        throw new NotFoundException(PostNotFound)
      }
      const post = await this.postRepository.findOne({
        where: { id: comment.postId },
      })

      return {
        id: hashtag.id,
        content: hashtag.content,
        createdAt: hashtag.createdAt,
        user,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          post,
          user: userComment,
        },
      }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findCommentHashtag (content: string): Promise<CommentHastageResponse> {
    const hashtag = await this.hashtagRepository.findOne({
      where: { content },
    })
    if (!hashtag) {
      throw new BadRequestException(HashtagNotFound)
    }

    const comment = await this.commentRepository.findOne({
      where: { id: hashtag.commentId },
    })
    if (!comment) {
      throw new NotFoundException(CommentNotFound)
    }

    const post = await this.postRepository.findOne({
      where: { id: comment.postId },
    })
    if (!post) {
      throw new NotFoundException(PostNotFound)
    }

    const user = await this.userRepository.findOne({
      where: { id: hashtag.userId },
    })
    if (!user) {
      throw new NotFoundException(PostNotFound)
    }

    const userComment = await this.userRepository.findOne({
      where: { id: comment.userId },
    })
    if (!userComment) {
      throw new NotFoundException(UserNameIsWrong)
    }

    return {
      id: hashtag.id,
      content: hashtag.content,
      createdAt: hashtag.createdAt,
      user,
      comment: {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        user: userComment,
        post,
      },
    }
  }

  async findAllCommentHashtag (
    commentId: number,
    limit: number,
    skip: number = 0,
  ): Promise<CommentHastageResponse[]> {
    const hashtags = await this.hashtagRepository.find({
      where: { commentId },
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    })

    if (hashtags.length === 0) {
      throw new BadRequestException(NoHashtages)
    }

    const users = await this.userLoader.loadMany(
      hashtags.map(hashtag => hashtag.userId),
    )

    const comments = await this.commentsLoader.batchComments.loadMany(
      hashtags.flat().map(post => post.id),
    )

    const validComments = comments
      .flat()
      .filter((c): c is Comment => !(c instanceof Error))

    const userComments = await this.userPostLoader.loadMany(
      validComments.map(comment => comment.userId),
    )

    const posts = await this.postLoader.batchPosts.loadMany(
      validComments.flat().map(h => h.postId),
    )

    const result = await Promise.all(
      hashtags.map(async (hashtag, index) => {
        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const post = posts[index]
        if (post instanceof Error) {
          throw new BadRequestException(NoPosts)
        }

        const comment = comments[index]
        if (comment instanceof Error) {
          throw new BadRequestException(NoPosts)
        }

        const userComment = userComments[index]
        if (userComment instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: hashtag.id,
          content: hashtag.content,
          createdAt: hashtag.createdAt,
          user: user,
          comment: {
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            post,
            user: userComment,
          },
        }
      }),
    )

    return result
  }

  async findAllUserHashtagOnComment (
    userId: number,
    limit: number = 10,
    skip: number = 0,
  ): Promise<CommentHastageResponse[]> {
    const hashtags = await this.hashtagRepository.find({
      where: { userId, commentId: Not(IsNull()) },
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    })

    if (hashtags.length === 0) {
      throw new BadRequestException(NoHashtages)
    }

    const users = await this.userLoader.loadMany(
      hashtags.map(hashtag => hashtag.userId),
    )

    const comments = await this.commentsLoader.batchComments.loadMany(
      hashtags.map(hashtag => hashtag.commentId),
    )

    const validComments = comments
      .flat()
      .filter((c): c is Comment => !(c instanceof Error))

    const userComments = await this.userPostLoader.loadMany(
      validComments.map(comment => comment.userId),
    )

    const posts = await this.postLoader.batchPosts.loadMany(
      validComments.flat().map(h => h.postId),
    )

    const result = await Promise.all(
      hashtags.map(async (hashtag, index) => {
        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const post = posts[index]
        if (post instanceof Error) {
          throw new BadRequestException(NoPosts)
        }

        const comment = comments[index]
        if (comment instanceof Error) {
          throw new BadRequestException(CommentsNotFound)
        }

        const userComment = userComments[index]
        if (userComment instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: hashtag.id,
          content: hashtag.content,
          createdAt: hashtag.createdAt,
          user: user,
          comment: {
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            post,
            user: userComment,
          },
        }
      }),
    )

    return result
  }

  async updateHastageComment (
    userId: number,
    id: number,
    commentId: number,
    content: string,
  ): Promise<CommentHastageResponse> {
    const query = this.hashtagRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      })
      if (!comment) {
        throw new NotFoundException(CommentNotFound)
      }

      const hashtag = await this.hashtagRepository.findOne({
        where: { userId, commentId, id },
      })
      if (!hashtag) {
        throw new BadRequestException(NoHashtage)
      }

      hashtag.content = content
      await this.hashtagRepository.save(hashtag)

      const post = await this.postRepository.findOne({
        where: { id: comment.postId },
      })

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new NotFoundException(UserNameIsWrong)
      }

      const userComment = await this.userRepository.findOne({
        where: { id: comment.userId },
      })
      if (!userComment) {
        throw new NotFoundException(PostNotFound)
      }

      return {
        id: hashtag.id,
        content: hashtag.content,
        createdAt: hashtag.createdAt,
        user,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: userComment,
          post,
        },
      }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findAllCommentHashtagCount (commentId: number) {
    return await this.hashtagRepository.count({
      where: { commentId },
    })
  }

  async findAllUserHashtagOnCommentCount (userId: number) {
    return await this.hashtagRepository.count({
      where: { userId, commentId: Not(IsNull()) },
    })
  }

  // ----------------- Reply ---------------------

  async createHastageReply (
    userId: number,
    replyId: number,
    content: string,
  ): Promise<ReplyHastageResponse> {
    const query = this.hashtagRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const reply = await this.replyRepository.findOne({
        where: { id: replyId },
      })
      if (!reply) {
        throw new NotFoundException(CommentNotFound)
      }

      const existingHashtag = await this.hashtagRepository.findOne({
        where: { content, userId, replyId },
      })
      if (existingHashtag) {
        throw new BadRequestException(HashtagExisted)
      }

      const hashtag = this.hashtagRepository.create({
        content,
        replyId,
        userId,
      })
      await this.hashtagRepository.save(hashtag)

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new NotFoundException(PostNotFound)
      }
      const userReply = await this.userRepository.findOne({
        where: { id: reply.userId },
      })
      if (!userReply) {
        throw new NotFoundException(PostNotFound)
      }
      const comment = await this.commentRepository.findOne({
        where: { id: reply.commentId },
      })

      return {
        id: hashtag.id,
        content: hashtag.content,
        createdAt: hashtag.createdAt,
        user,
        reply: {
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          user: userReply,
          comment,
        },
      }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findReplyHashtag (content: string): Promise<ReplyHastageResponse> {
    const hashtag = await this.hashtagRepository.findOne({
      where: { content },
    })
    if (!hashtag) {
      throw new BadRequestException(HashtagNotFound)
    }

    const reply = await this.replyRepository.findOne({
      where: { id: hashtag.replyId },
    })
    if (!reply) {
      throw new NotFoundException(PostNotFound)
    }

    const comment = await this.commentRepository.findOne({
      where: { id: reply.commentId },
    })
    if (!comment) {
      throw new NotFoundException(PostNotFound)
    }

    const user = await this.userRepository.findOne({
      where: { id: hashtag.userId },
    })
    if (!user) {
      throw new NotFoundException(PostNotFound)
    }

    const userReply = await this.userRepository.findOne({
      where: { id: reply.userId },
    })
    if (!userReply) {
      throw new NotFoundException(UserNameIsWrong)
    }

    return {
      id: hashtag.id,
      content: hashtag.content,
      createdAt: hashtag.createdAt,
      user,
      reply: {
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        user: userReply,
        comment,
      },
    }
  }

  async findAllReplyHashtag (
    replyId: number,
    limit: number,
    skip: number = 0,
  ): Promise<ReplyHastageResponse[]> {
    const hashtags = await this.hashtagRepository.find({
      where: { replyId },
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    })

    if (hashtags.length === 0) {
      throw new NotFoundException(NoHashtages)
    }

    const users = await this.userLoader.loadMany(
      hashtags.map(hashtag => hashtag.userId),
    )

    const replys = await this.replyLoader.batchReplys.loadMany(
      hashtags.map(hashtag => hashtag.replyId),
    )
    const validReplys = replys.filter((c): c is Reply => !(c instanceof Error))

    const comments = await this.commentsLoader.batchComments.loadMany(
      validReplys.flat().map(h => h.commentId),
    )
    const validcomments = comments.filter(
      (c): c is Comment => !(c instanceof Error),
    )

    const userComments = await this.userPostLoader.loadMany(
      validcomments.flat().map(comment => comment.userId),
    )

    const result = await Promise.all(
      hashtags.map(async (hashtag, index) => {
        const comment = comments.flat()[index]
        if (comment instanceof Error) {
          throw new BadRequestException(NoPosts)
        }

        const reply = replys[index]
        if (reply instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const userComment = userComments[index]
        if (userComment instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: hashtag.id,
          content: hashtag.content,
          createdAt: hashtag.createdAt,
          user: user,
          reply: {
            id: reply.id,
            content: reply.content,
            createdAt: reply.createdAt,
            user: userComment,
            comment,
          },
        }
      }),
    )

    return result
  }

  async findAllUserHashtagOnReply (
    userId: number,
    limit: number = 10,
    skip: number = 0,
  ): Promise<ReplyHastageResponse[]> {
    const hashtags = await this.hashtagRepository.find({
      where: { userId, replyId: Not(IsNull()) },
      take: limit,
      skip,
      order: { createdAt: 'DESC' },
    })

    if (hashtags.length === 0) {
      throw new BadRequestException(NoHashtages)
    }

    const users = await this.userLoader.loadMany(
      hashtags.map(hashtag => hashtag.userId),
    )

    console.log(hashtags)
    const replys = await this.replyLoader.batchReplys.loadMany(
      hashtags.map(hashtag => hashtag.replyId),
    )
    const validReplys = replys.filter((c): c is Reply => !(c instanceof Error))

    const comments = await this.commentsLoader.batchComments.loadMany(
      validReplys.flat().map(h => h.commentId),
    )
    const validcomments = comments.filter(
      (c): c is Comment => !(c instanceof Error),
    )

    const userComments = await this.userPostLoader.loadMany(
      validcomments.flat().map(comment => comment.userId),
    )

    const result = await Promise.all(
      hashtags.map(async (hashtag, index) => {
        const comment = comments.flat()[index]
        if (comment instanceof Error) {
          throw new BadRequestException(NoPosts)
        }

        const reply = replys[index]
        if (reply instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const user = users[index]
        if (user instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        const userComment = userComments[index]
        if (userComment instanceof Error) {
          throw new NotFoundException(UserNameIsWrong)
        }

        return {
          id: hashtag.id,
          content: hashtag.content,
          createdAt: hashtag.createdAt,
          user: user,
          reply: {
            id: reply.id,
            content: reply.content,
            createdAt: reply.createdAt,
            user: userComment,
            comment,
          },
        }
      }),
    )

    return result
  }

  async updateHastageReply (
    userId: number,
    id: number,
    replyId: number,
    content: string,
  ): Promise<ReplyHastageResponse> {
    const query = this.hashtagRepository.manager.connection.createQueryRunner()
    await query.startTransaction()

    try {
      const reply = await this.replyRepository.findOne({
        where: { id: replyId },
      })
      if (!reply) {
        throw new NotFoundException(CommentNotFound)
      }

      const hashtag = await this.hashtagRepository.findOne({
        where: { id, userId, replyId },
      })
      if (!hashtag) {
        throw new BadRequestException(NoHashtage)
      }

      hashtag.content = content
      await this.hashtagRepository.save(hashtag)

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        throw new NotFoundException(PostNotFound)
      }
      const userReply = await this.userRepository.findOne({
        where: { id: reply.userId },
      })
      if (!userReply) {
        throw new NotFoundException(PostNotFound)
      }
      const comment = await this.commentRepository.findOne({
        where: { id: reply.commentId },
      })

      return {
        id: hashtag.id,
        content: hashtag.content,
        createdAt: hashtag.createdAt,
        user,
        reply: {
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          user: userReply,
          comment,
        },
      }
    } catch (error) {
      await query.rollbackTransaction()
      throw error
    } finally {
      await query.release()
    }
  }

  async findAllReplyHashtagCount (replyId: number) {
    return await this.hashtagRepository.count({
      where: { replyId },
    })
  }

  async findAllUserHashtagOnReplyCount (userId: number) {
    return await this.hashtagRepository.count({
      where: { userId, replyId: Not(IsNull()) },
    })
  }

  // ------------Global--------

  async deleteHastage (id: number): Promise<string> {
    const hastage = await this.hashtagRepository.findOne({ where: { id } })
    if (!hastage) {
      throw new NotFoundException(HashtagNotFound)
    }
    await this.hashtagRepository.remove(hastage)
    return DeleteHashtage
  }
}
