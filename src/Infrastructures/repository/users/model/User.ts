/* eslint-disable @typescript-eslint/indent */
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { Thread } from '../../threads/model/Thread'
import { Comment } from '../../comments/model/Comment'
import { Reply } from '../../replies/model/Reply'
import { type User as UserDomain } from '../../../../Domains/users/types/User'

@Entity('users')
export class User implements UserDomain {
  @PrimaryColumn({
    length: 50
  })
  id!: string

  @Column({
    length: 50,
    unique: true
  })
  username!: string

  @Column('text')
  password!: string

  @Column({
    type: 'varchar',
    name: 'full_name'
  })
  fullName!: string

  @OneToMany(() => Thread, (thread) => thread.owner)
  threads!: Thread[]

  @OneToMany(() => Comment, (comment) => comment.commenter)
  comments!: Comment[]

  @OneToMany(() => Reply, (reply) => reply.replier)
  replies!: Reply[]
}
