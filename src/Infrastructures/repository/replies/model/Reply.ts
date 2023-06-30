/* eslint-disable @typescript-eslint/indent */
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/model/User'
import { Comment } from '../../comments/model/Comment'

@Entity('replies')
export class Reply {
  @PrimaryColumn({
    length: 50
  })
  id!: string

  @Column({
    length: 255
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

  @ManyToOne(() => User, (user) => user.replies)
  @JoinColumn({ name: 'replier_id' })
  @Index()
  replier!: User

  @ManyToOne(() => Comment, (comment) => comment.replies)
  @JoinColumn({ name: 'comment_id' })
  @Index()
  comment!: Comment
}
