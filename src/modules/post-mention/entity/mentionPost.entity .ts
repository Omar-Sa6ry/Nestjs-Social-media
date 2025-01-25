import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Post } from '../../post/entity/post.entity '

@Entity()
@ObjectType()
export class PostMention {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => Int)
  userId: number

  @Column({ nullable: true })
  @Field(() => Int)
  to: number

  @Field(() => Int)
  @Column({ nullable: true })
  postId: number

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  mentionFrom: User

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to' })
  mentionTo: User

  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

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
