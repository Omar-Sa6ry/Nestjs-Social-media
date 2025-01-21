import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Post } from '../../post/entity/post.entity '

@Entity()
@ObjectType()
export class Mention_Post {
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
  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  postId: number

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
