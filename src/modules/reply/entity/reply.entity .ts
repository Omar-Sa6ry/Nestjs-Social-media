import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Mention } from 'src/modules/mention/entity/mention.entity '
import { User } from 'src/modules/users/entity/user.entity'
import { Like } from 'src/modules/like/entity/like.entity '
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { Hashtag } from 'src/modules/hastage/entity/hastage.entity'
import { Post } from '../../post/entity/post.entity '
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
@Index('idx_reply_userId', ['userId'])
@Index('idx_reply_commentId', ['commentId'])
export class Reply {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String)
  content: string

  @Field(() => Int)
  @Column({ nullable: true })
  commentId: number

  @Field(() => Int)
  @Column({ nullable: true })
  userId: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @OneToMany(() => Hashtag, hashtag => hashtag.reply, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  hashtags: Hashtag[]

  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment

  @OneToMany(() => Mention, mention => mention.commentId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionReply: Mention[]

  @OneToMany(() => Like, like => like.commentId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  likeReply: Like[]

  @AfterInsert()
  logInsert () {
    console.log('Inserted Reply Comment with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Reply Comment with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Reply Comment with id: ' + this.id)
  }
}
