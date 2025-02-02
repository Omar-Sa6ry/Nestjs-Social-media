import { Post } from 'src/modules/post/entity/post.entity '
import { User } from 'src/modules/users/entity/user.entity'
import { In, Repository } from 'typeorm'
import { Comment } from '../entity/comment.entity '
import * as DataLoader from 'dataloader'

export function createCommentDetailsLoader (
  commentRepository: Repository<Comment>,
  postRepository: Repository<Post>,
  userRepository: Repository<User>,
) {
  return new DataLoader<number, any>(async (commentIds: number[]) => {
    const comments = await commentRepository.find({
      where: { id: In(commentIds) },
    })

    const postIds = comments.map(comment => comment.postId)
    const posts = await postRepository.findByIds(postIds)
    const postMap = new Map(posts.map(post => [post.id, post]))

    const userIds = comments.map(comment => comment.userId)
    const users = await userRepository.findByIds(userIds)
    const userMap = new Map(users.map(user => [user.id, user]))

    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      post: postMap.get(comment.postId) || null,
      user: userMap.get(comment.userId) || null,
      createdAt: comment.createdAt,
    }))
  })
}
