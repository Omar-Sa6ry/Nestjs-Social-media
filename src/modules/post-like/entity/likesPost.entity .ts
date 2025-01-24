import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Post } from '../../post/entity/post.entity '
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

@Entity()
@ObjectType()
export class PostLike {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => Int)
  userId: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @Column({ nullable: true })
  @Field(() => Int)
  postId: number

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post

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
