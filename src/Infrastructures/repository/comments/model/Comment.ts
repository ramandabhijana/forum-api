/* eslint-disable @typescript-eslint/indent */
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/model/User'
import { Thread } from '../../threads/model/Thread'
import { Reply } from '../../replies/model/Reply'

@Entity('comments')
export class Comment {
  @PrimaryColumn({
    length: 50
  })
  id!: string

  @Column({
    length: 150
  })
  content!: string

  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt!: Date

  @UpdateDateColumn({
    name: 'updated_at'
  })
  updatedAt!: Date

  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true
  })
  deletedAt?: Date

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'commenter_id' })
  @Index()
  commenter!: User

  @ManyToOne(() => Thread, (thread) => thread.comments)
  @JoinColumn({ name: 'thread_id' })
  @Index()
  thread!: Thread

  @OneToMany(() => Reply, (reply) => reply.comment, { cascade: ['insert'] })
  replies!: Reply[]
}
