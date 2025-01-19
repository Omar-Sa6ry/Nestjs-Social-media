import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'
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
import { Post } from './post.entity '
import { Mention_Comment } from './mentionComment.entity  '

@Entity()
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String)
  content: string

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  userId: number

  @Field(() => Int)
  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  postId: number

  @OneToMany(() => Mention_Comment, mention_Comment => mention_Comment.commentId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionComment: Mention_Comment[]

  @AfterInsert()
  logInsert () {
    console.log('Inserted Comment with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Comment with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Comment with id: ' + this.id)
  }
}
