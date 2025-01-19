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
export class Friendship {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column({ nullable: true })
  @Field(() => String)
  status: string

  @Field(() => Int)
  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  userId: number

  @AfterInsert()
  logInsert () {
    console.log('Inserted Friendship with id: ' + this.id)
  }

  @AfterUpdate()
  logUpdate () {
    console.log('Updated Friendship with id: ' + this.id)
  }

  @AfterRemove()
  logRemove () {
    console.log('Removed Friendship with id: ' + this.id)
  }
}
