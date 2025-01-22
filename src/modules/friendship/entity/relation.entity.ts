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
export class Relation {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  @Field(() => String)
  status: string

  @Column({ type: 'int' })
  @Field(() => Int)
  userId: number

  @ManyToOne(() => User, user => user.relations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column({ type: 'int' })
  @Field(() => Int)
  friendId: number

  @ManyToOne(() => User, user => user.friendRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friendId' })
  friend: User

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
