import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'
import { Like } from 'src/modules/like/entity/like.entity '
import { Hashtag } from 'src/modules/hastage/entity/hastage.entity'
import { Mention } from 'src/modules/mention/entity/mention.entity '
import { Image } from './image.entity'
import { Comment } from '../../comment/entity/comment.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
@Index('idx_post_userId', ['userId'])
export class Post {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  content: string

  @Column({ nullable: true })
  @Field(() => Int)
  userId: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Field(() => [String], { nullable: true })
  @OneToMany(() => Image, image => image.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  images: string[]

  @OneToMany(() => Hashtag, hashtag => hashtag.post, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  hashtags: Hashtag[]

  @OneToMany(() => Comment, comment => comment.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  comments: Comment[]

  @OneToMany(() => Like, Like => Like.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  likesPost: Like[]

  @OneToMany(() => Mention, mention => mention.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionPost: Mention[]

  @AfterInsert()
  logInsert () {
    console.log('Inserted Post with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Post with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Post with id: ' + this.id)
  }
}
