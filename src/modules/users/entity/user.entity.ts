import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Role } from 'src/common/constant/enum.constant'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { Like_Comment } from 'src/modules/comment-like/entity/likesComment.entity  '
import { Like_Post } from 'src/modules/post-like/entity/likesPost.entity '
import { Mention_Post } from 'src/modules/post-mention/entity/mentionPost.entity '
import { Message } from 'src/modules/message/entity/message.entity'
import { Relation } from 'src/modules/friendship/entity/relation.entity'
import { Notification } from 'src/modules/notification/entity/notification.entity'
import { Post } from 'src/modules/post/entity/post.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  userName: string

  @Column({ nullable: true })
  @Field(() => String)
  avatar: string

  @Column({ nullable: true })
  @Field(() => String)
  bio: string

  @Column({ unique: true })
  @Field(() => String)
  phone: string

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  email: string

  @Column()
  @Field(() => String)
  password: string

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role

  @Column({ nullable: true })
  resetToken?: string

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date | null

  @OneToMany(() => Notification, notification => notification.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  notifications: Notification[]

  @OneToMany(() => Relation, relation => relation.userId)
  relations: Relation[]

  @OneToMany(() => Relation, relation => relation.friendId)
  friendRelations: Relation[]

  @OneToMany(() => Message, message => message.recieverId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  reciever: Message[]

  @OneToMany(() => Message, message => message.senderId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  sender: Message[]

  @OneToMany(() => Post, post => post.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  post: Post[]

  @OneToMany(() => Mention_Post, mention_Post => mention_Post.mentionTo, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionTo: Mention_Post[]

  @OneToMany(() => Mention_Post, mention_Post => mention_Post.mentionFrom, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionfrom: Mention_Post[]

  @OneToMany(() => Comment, comment => comment.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  comments: Comment[]

  @OneToMany(() => Like_Comment, like_Comment => like_Comment.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  commentLikes: Like_Comment[]

  @OneToMany(() => Like_Post, like_Post => like_Post.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  PostLikes: Like_Post[]

  @AfterInsert()
  logInsert () {
    console.log('Inserted User with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated User with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed User with id: ' + this.id)
  }
}
