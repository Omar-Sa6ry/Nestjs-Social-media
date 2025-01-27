import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Post } from '../../post/entity/post.entity '
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { User } from 'src/modules/users/entity/user.entity'
import { Reply } from 'src/modules/comment copy/entity/reply.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Mention {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => Int)
  userId: number

  @Column({ nullable: true })
  @Field(() => Int)
  to: number

  @Field(() => Int)
  @Column({ nullable: true })
  postId: number

  @Field(() => Int)
  @Column({ nullable: true })
  commentId: number

  @ManyToOne(() => Comment, comment => comment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment

  @ManyToOne(() => Comment, comment => comment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  reply: Reply

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  mentionFrom: User

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to' })
  mentionTo: User

  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @AfterInsert()
  logInsert () {
    console.log('Inserted mention with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated mention with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed mention with id: ' + this.id)
  }
}
