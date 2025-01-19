import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Like_Comment } from './likesComment.entity  '
import { Like_Post } from './likesPost.entity '
import { User } from 'src/modules/users/entity/user.entity'
import { Mention_Post } from './mentionPost.entity '
import { Comment } from './comment.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Post {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String)
  content: string

  @Column({ nullable: true })
  @Field(() => String)
  image: string

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  userId: number

  @OneToMany(() => Comment, comment => comment.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  comments: Comment[]

  @OneToMany(() => Like_Comment, like_Comment => like_Comment.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  likesComment: Like_Comment[]

  @OneToMany(() => Like_Post, like_Post => like_Post.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  likesPost: Like_Post[]

  @OneToMany(() => Mention_Post, mention_Post => mention_Post.postId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionPost: Mention_Post[]

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
