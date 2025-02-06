import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { Post } from 'src/modules/post/entity/post.entity '
import { Reply } from 'src/modules/reply/entity/reply.entity '
import { User } from 'src/modules/users/entity/user.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  AfterInsert,
  AfterRemove,
  AfterUpdate,
} from 'typeorm'

@Entity()
@ObjectType()
export class Hashtag {
  [x: string]: any
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Field(() => String)
  content: string

  @Column({ nullable: true })
  @Field(() => Int)
  userId: number

  @Column({ nullable: true })
  @Field(() => Int)
  postId: number

  @Column({ nullable: true })
  @Field(() => Int)
  commentId: number

  @Column({ nullable: true })
  @Field(() => Int)
  replyId: number

  @ManyToOne(() => Comment, comment => comment.hashtags, { nullable: true })
  @JoinColumn({ name: 'commentId' })
  comment: Comment

  @ManyToOne(() => User, user => user.hashtags, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Reply, reply => reply.hashtags, { nullable: true })
  @JoinColumn({ name: 'replyId' })
  reply: Reply

  @ManyToOne(() => Post, post => post.hashtags, { nullable: true })
  @JoinColumn({ name: 'postId' })
  post: Post

  @CreateDateColumn({ type: 'date' })
  @Transform(({ value }) => new Date(value).toLocaleString(), {
    toClassOnly: true,
  })
  createdAt: Date

  @AfterInsert()
  logInsert () {
    console.log('Inserted Hastage with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Hastage with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Hastage with id: ' + this.id)
  }
}
