import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { IsEnum, IsNotEmpty } from 'class-validator'
import { DocumentEntity } from './document.entity'
import { IngestionStatusEnum } from '../enums/ingestion-status.enum'
@Entity('ingestion_status')
export class IngestionStatus {
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  id!: number

  @Column()
  @IsNotEmpty()
  documentId!: number

  @ManyToOne(() => DocumentEntity)
  @JoinColumn({ name: 'documentId' })
  @IsNotEmpty()
  document!: DocumentEntity

  @Column({
    type: 'enum',
    enum: IngestionStatusEnum,
    default: IngestionStatusEnum.PENDING,
  })
  @IsEnum(IngestionStatusEnum)
  @IsNotEmpty()
  status!: IngestionStatusEnum

  @Column({ type: 'text', nullable: true })
  error?: string | null

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>

  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  startedAt!: Date

  @CreateDateColumn({ name: 'created_at' })
  @IsNotEmpty()
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  @IsNotEmpty()
  updatedAt!: Date
}
