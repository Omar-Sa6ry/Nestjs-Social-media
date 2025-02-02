import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Status } from 'src/common/constant/enum.constant'
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Block {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ type: 'int' })
  @Field(() => Int)
  followerId: number

  @Column({ type: 'int' })
  @Field(() => Int)
  followingId: number

  @ManyToOne(() => User, user => user.relations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User

  @ManyToOne(() => User, user => user.friendRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User

  @AfterInsert()
  logInsert () {
    console.log('Inserted Relation with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Relation with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Relation with id: ' + this.id)
  }
}
