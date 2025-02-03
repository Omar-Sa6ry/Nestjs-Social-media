import * as DataLoader from 'dataloader'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { LikeService } from 'src/modules/like/like.service'
import { UserNotFound } from '../constant/messages.constant'
import { User } from 'src/modules/users/entity/user.entity'
import { Repository, In } from 'typeorm'
import { Post } from 'src/modules/post/entity/post.entity '
import { Mention } from 'src/modules/mention/entity/mention.entity '
import { Image } from 'src/modules/post/entity/image.entity'

export function createUserLoader (userRepository: Repository<User>) {
  return new DataLoader<number, User>(async (userIds: number[]) => {
    const users = await userRepository.findByIds(userIds)
    const userMap = new Map(users.map(user => [user.id, user]))
    return userIds.map(id => userMap.get(id) || new Error(UserNotFound))
  })
}

export function createLikeLoader (likeService: LikeService) {
  return new DataLoader<number, number>(async (postIds: number[]) => {
    const likesMap = new Map<number, number>()
    await Promise.all(
      postIds.map(async postId => {
        const count = await likeService.numPostLikes(postId)
        likesMap.set(postId, count)
      }),
    )

    return postIds.map(id => likesMap.get(id) || 0)
  })
}

export function createImageLoader (imageRepository: Repository<Image>) {
  return new DataLoader<number, Image[]>(async (postIds: number[]) => {
    const images = await imageRepository.find({
      where: { postId: In(postIds) },
      select: ['path'],
    })

    // const images: string[] = []
    // await imgs.map(i => i.path)

    const imageMap = new Map<number, Image[]>(postIds.map(id => [id, []]))
    images.forEach(image => imageMap.get(image.postId)?.push(image))
    return postIds.map(id => imageMap.get(id) || [])
  })
}

export function createCommentLoader (commentRepository: Repository<Comment>) {
  return new DataLoader<number, Comment[]>(async (postIds: number[]) => {
    const comments = await commentRepository.find({
      where: { postId: In(postIds) },
    })
    const commentMap = new Map<number, Comment[]>(postIds.map(id => [id, []]))
    comments.forEach(comment => commentMap.get(comment.postId)?.push(comment))
    return postIds.map(id => commentMap.get(id) || [])
  })
}

export function createPostMentionLoader (
  userRepository: Repository<User>,
  postRepository: Repository<Post>,
  mentionRepository: Repository<Mention>,
) {
  return new DataLoader<
    { userId: number; mentionTo: number; postId: number },
    any
  >(async keys => {
    const mentionTos = keys.map(k => k.mentionTo)
    const userIds = keys.map(k => k.userId)
    const postIds = keys.map(k => k.postId)

    const users = await userRepository.find({
      where: { id: In([...userIds, ...mentionTos]) },
    })
    const userMap = new Map(users.map(user => [user.id, user]))

    const posts = await postRepository.find({ where: { id: In(postIds) } })
    const postMap = new Map(posts.map(post => [post.id, post]))

    const mentions = await mentionRepository.find({
      where: {
        to: In(mentionTos),
        postId: In(postIds),
        userId: In(userIds),
      },
    })
    const mentionMap = new Map(
      mentions.map(mention => [
        `${mention.to}-${mention.postId}-${mention.userId}`,
        mention,
      ]),
    )

    return keys.map(({ userId, mentionTo, postId }) => {
      const mention = mentionMap.get(`${mentionTo}-${postId}-${userId}`)
      if (!mention) return null

      const user = userMap.get(userId)
      const mentionUser = userMap.get(mentionTo)
      const post = postMap.get(postId)

      if (!user || !mentionUser || !post) return null

      return {
        id: mention.id,
        mentionFrom: user,
        mentionTo: mentionUser,
        post,
        createdAt: mention.createdAt,
      }
    })
  })
}

export function createCommentMentionLoader (
  userRepository: Repository<User>,
  commentRepository: Repository<Comment>,
  mentionRepository: Repository<Mention>,
) {
  return new DataLoader<
    { userId: number; mentionTo: number; commentId: number },
    any
  >(async keys => {
    const mentionTos = keys.map(k => k.mentionTo)
    const userIds = keys.map(k => k.userId)
    const commentIds = keys.map(k => k.commentId)

    const users = await userRepository.find({
      where: { id: In([...userIds, ...mentionTos]) },
    })
    const userMap = new Map(users.map(user => [user.id, user]))

    const comments = await commentRepository.find({
      where: { id: In(commentIds) },
    })
    const commentMap = new Map(comments.map(comment => [comment.id, comment]))

    const mentions = await mentionRepository.find({
      where: {
        to: In(mentionTos),
        commentId: In(commentIds),
        userId: In(userIds),
      },
    })
    const mentionMap = new Map(
      mentions.map(mention => [
        `${mention.to}-${mention.commentId}-${mention.userId}`,
        mention,
      ]),
    )

    return keys.map(({ userId, mentionTo, commentId }) => {
      const mention = mentionMap.get(`${mentionTo}-${commentId}-${userId}`)
      if (!mention) return null

      const user = userMap.get(userId)
      const mentionUser = userMap.get(mentionTo)
      const comment = commentMap.get(commentId)

      if (!user || !mentionUser || !comment) return null

      return {
        id: mention.id,
        mentionFrom: user,
        mentionTo: mentionUser,
        comment,
        createdAt: mention.createdAt,
      }
    })
  })
}
