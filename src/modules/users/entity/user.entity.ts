import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Role, UserStatus } from 'src/common/constant/enum.constant'
import { Comment } from 'src/modules/comment/entity/comment.entity '
import { Message } from 'src/modules/message/entity/message.entity'
import { Like } from 'src/modules/like/entity/like.entity '
import { Follow } from 'src/modules/follow/entity/follow.entity'
import { Notification } from 'src/modules/notification/entity/notification.entity'
import { Exclude } from 'class-transformer'
import { Mention } from 'src/modules/mention/entity/mention.entity '
import { Hashtag } from 'src/modules/hastage/entity/hastage.entity'
import { Post } from 'src/modules/post/entity/post.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
@Index('idx_phone', ['phone'])
@Index('idx_userName', ['userName'])
@Index('idx_email', ['email'])
@Index('idx_avatar', ['avatar'])
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
  @Field(() => String, { nullable: true })
  bio: string

  @Column({ unique: true })
  @Field(() => String)
  phone: string

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  email: string

  @Column()
  @Exclude()
  password: string

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  @Exclude()
  role: Role

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PUBLIC,
  })
  status: UserStatus

  @Column({ nullable: true })
  @Exclude()
  resetToken?: string

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  resetTokenExpiry?: Date | null

  @Column({ nullable: true })
  @Exclude()
  fcmToken: string

  @OneToMany(() => Notification, notification => notification.senderId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  notificationS: Notification[]

  @OneToMany(() => Notification, notification => notification.receiverId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  notificationR: Notification[]

  @OneToMany(() => Follow, Follow => Follow.followerId)
  relations: Follow[]

  @OneToMany(() => Follow, Follow => Follow.followingId)
  friendRelations: Follow[]

  @OneToMany(() => Hashtag, hashtag => hashtag.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  hashtags: Hashtag[]

  @OneToMany(() => Message, message => message.receiverId, {
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

  @OneToMany(() => Mention, mention => mention.mentionTo, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionTo: Mention[]

  @OneToMany(() => Mention, mention => mention.mentionFrom, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  mentionfrom: Mention[]

  @OneToMany(() => Comment, comment => comment.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  comments: Comment[]

  @OneToMany(() => Like, like => like.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  PostLikes: Like[]

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
