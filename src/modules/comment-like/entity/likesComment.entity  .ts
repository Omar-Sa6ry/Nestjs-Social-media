import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Comment } from '../../comment/entity/comment.entity '
import { Post } from '../../post/entity/post.entity '
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Like_Comment {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Field(() => Int)
  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  postId: number

  @Field(() => Int)
  @ManyToOne(() => Comment, comment => comment.id, { onDelete: 'CASCADE' })
  commentId: number

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  userId: number

  @AfterInsert()
  logInsert () {
    console.log('Inserted Like_Comment with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Like_Comment with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Like_Comment with id: ' + this.id)
  }
}
