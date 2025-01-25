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
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class CommentLike {
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
  commentId: number


  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Comment, comment => comment.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment

  @AfterInsert()
  logInsert () {
    console.log('Inserted Like_Post with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Like_Post with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Like_Post with id: ' + this.id)
  }
}
