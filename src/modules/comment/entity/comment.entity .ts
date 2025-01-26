import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Mention } from 'src/modules/mention/entity/mention.entity '
import { User } from 'src/modules/users/entity/user.entity'
import { Post } from '../../post/entity/post.entity '
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

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
  @Column({ nullable: true })
  postId: number

  @Field(() => Int)
  @Column({ nullable: true })
  userId: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Post, post => post.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post

  @OneToMany(
    () => Mention,
    mention => mention.commentId,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  mentionComment: Mention[]

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
