import { Field, Int, ObjectType } from '@nestjs/graphql'
import { User } from 'src/modules/users/entity/user.entity'
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
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
@ObjectType()
@Index('idx_message_senderId', ['senderId']) 
@Index('idx_message_receiverId', ['receiverId']) 
export class Message {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String)
  content: string

  @Column({ default: false })
  Isread: boolean

  @Column({ type: 'int' })
  @Field(() => Int)
  senderId: number

  @Column({ type: 'int' })
  @Field(() => Int)
  receiverId: number

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date

  @ManyToOne(() => User, user => user.relations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User

  @ManyToOne(() => User, user => user.friendRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver: User

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
