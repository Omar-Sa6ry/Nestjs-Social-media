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
export class Notification {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String)
  content: string

  @Column({ default: false })
  @Field(() => Boolean)
  isRead: boolean

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  userId: number

  @AfterInsert()
  logInsert () {
    console.log('Inserted Notification with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Notification with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Notification with id: ' + this.id)
  }
}
