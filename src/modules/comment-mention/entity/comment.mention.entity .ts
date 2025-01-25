import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
@ObjectType()
export class CommentMention {
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
  commentId: number

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  mentionFrom: User

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to' })
  mentionTo: User

  @ManyToOne(() => Comment, comment => comment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @AfterInsert()
  logInsert () {
    console.log('Inserted Mention_Post with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Mention_Post with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Mention_Post with id: ' + this.id)
  }
}
