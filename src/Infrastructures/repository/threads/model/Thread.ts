/* eslint-disable @typescript-eslint/indent */
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/model/User'
import { Comment } from '../../comments/model/Comment'

@Entity('threads')
export class Thread {
  @PrimaryColumn({
    length: 50
  })
  id!: string

  @Column({
    length: 100
  })
  title!: string

  @Column({
    length: 255
  })
  body!: string

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

  @ManyToOne(() => User, (user) => user.threads)
  @JoinColumn({ name: 'owner_id' })
  @Index()
  owner!: User

  @OneToMany(() => Comment, (comment) => comment.thread)
  comments!: Comment[]
}
