/* eslint-disable @typescript-eslint/indent */
import { Entity, PrimaryColumn } from 'typeorm'

@Entity('authentications')
export class Authentication {
  @PrimaryColumn('text')
  token!: string
}
