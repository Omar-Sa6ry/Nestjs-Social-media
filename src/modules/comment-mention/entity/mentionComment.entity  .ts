import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'
import { Comment } from '../../comment/entity/comment.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Mention_Comment {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  mentionFrom: number

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  mentionTo: number

  @Field(() => Int)
  @ManyToOne(() => Comment, comment => comment.id, { onDelete: 'CASCADE' })
  commentId: number

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
