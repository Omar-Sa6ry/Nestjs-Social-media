import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Post } from '../../post/entity/post.entity '
import { User } from 'src/modules/users/entity/user.entity'
import { Comment } from 'src/modules/comment/entity/comment.entity '
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
export class Like {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => Int)
  userId: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @Column({ nullable: true })
  @Field(() => Int)
  postId: number

  @Column({ nullable: true })
  @Field(() => Int)
  commentId: number

  @ManyToOne(() => Comment, comment => comment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post
  content: any

  @AfterInsert()
  logInsert () {
    console.log('Inserted Like with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Like with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Like with id: ' + this.id)
  }
}
