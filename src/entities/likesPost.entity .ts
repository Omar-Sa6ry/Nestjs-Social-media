import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Post } from './post.entity '
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
export class Like_Post {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Field(() => Int)
  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  postId: number

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  userId: number

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
