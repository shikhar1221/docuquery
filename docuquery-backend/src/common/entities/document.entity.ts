import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { UserEntity } from './user.entity'

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column({ nullable: true })
  description!: string

  @Column()
  filePath!: string

  @Column()
  fileName!: string

  @Column()
  mimeType!: string

  @Column('bigint')
  size!: number

  @Column()
  uploadDate!: Date

  @ManyToOne(() => UserEntity, (user) => user.documents, { onDelete: 'CASCADE' })
  user!: UserEntity

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
