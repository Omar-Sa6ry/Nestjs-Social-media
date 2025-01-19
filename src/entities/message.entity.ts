import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Message {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String)
  content: string

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  senderId: number

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  recieverId: number

  @AfterInsert()
  logInsert () {
    console.log('Inserted Message with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Message with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Message with id: ' + this.id)
  }
}
