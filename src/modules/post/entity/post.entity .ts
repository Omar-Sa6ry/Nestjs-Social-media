import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Like_Comment } from '../../comment-like/entity/likesComment.entity  '
import { User } from 'src/modules/users/entity/user.entity'
import { Image } from './image.entity'
import { Comment } from '../../comment/entity/comment.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PostLike } from 'src/modules/post-like/entity/likesPost.entity '
import { PostMention } from 'src/modules/post-mention/entity/mentionPost.entity '

@Entity()
@ObjectType()
export class Post {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  content: string

  @Column({ nullable: true })
  @Field(() => Int)
  userId: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Field(() => [String], { nullable: true })
  @OneToMany(() => Image, image => image.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  images: string[]

  @OneToMany(() => Comment, comment => comment.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  comments: Comment[]

  @OneToMany(() => Like_Comment, like_Comment => like_Comment.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  likesComment: Like_Comment[]

  @OneToMany(() => PostLike, postLike => postLike.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  likesPost: PostLike[]

  @OneToMany(() => PostMention, mention_Post => mention_Post.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionPost: PostMention[]

  @AfterInsert()
  logInsert () {
    console.log('Inserted Post with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Post with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Post with id: ' + this.id)
  }
}
