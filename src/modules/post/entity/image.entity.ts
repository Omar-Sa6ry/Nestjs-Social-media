import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Post } from './post.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
@Index('idx_image_path', ['path'])
@Index('idx_image_postId', ['postId'])
export class Image {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field(() => String)
  path: string

  @Field(() => Int)
  @Column()
  postId: number

  @ManyToOne(() => Post, post => post.images, { onDelete: 'CASCADE' })
  post: Post

  @AfterInsert()
  logInsert () {
    console.log('Inserted Images with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Images with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Images with id: ' + this.id)
  }
}
