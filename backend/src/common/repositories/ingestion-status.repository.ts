import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { IngestionStatus } from '../entities/ingestion-status.entity'
import { IngestionStatusEnum } from '../enums/ingestion-status.enum'
import { CreateIngestionStatusDto } from 'src/modules/ingestion/dto/create-ingestion-status.dto'

@Injectable()
export class IngestionStatusRepository extends Repository<IngestionStatus> {
  constructor(private dataSource: DataSource) {
    super(IngestionStatus, dataSource.createEntityManager())
  }

  async findOneById(id: number): Promise<IngestionStatus | null> {
    return this.findOne({ where: { id } })
  }

  async createIngestionStatus(ingestionStatus: CreateIngestionStatusDto): Promise<IngestionStatus> {
    const status = new IngestionStatus()
    status.documentId = parseInt(ingestionStatus.documentId, 10)
    status.status = ingestionStatus.status || IngestionStatusEnum.PENDING
    status.startedAt = ingestionStatus.startedAt || new Date()
    status.updatedAt = new Date()
    status.metadata = {
      retryCount: 0,
      fileName: ingestionStatus.metadata?.fileName || null,
      filePath: ingestionStatus.metadata?.filePath || null,
      createdAt: new Date().toISOString(),
      ...(ingestionStatus.metadata || {}),
    }
    status.error = null

    return this.save(status)
  }

  async updateStatus(id: number, updates: Partial<IngestionStatus>): Promise<IngestionStatus> {
    const status = await this.findOneById(id)
    if (!status) {
      throw new Error('Ingestion status not found')
    }

    Object.assign(status, {
      ...updates,
      updatedAt: new Date(),
    })

    return this.save(status)
  }

  async findByDocumentId(documentId: number): Promise<IngestionStatus[]> {
    return this.find({
      where: { documentId: documentId },
      order: { createdAt: 'DESC' },
    })
  }

  async findLatestByDocumentId(documentId: number): Promise<IngestionStatus | null> {
    const statuses = await this.find({
      where: { documentId: documentId },
      order: { createdAt: 'DESC' },
      take: 1,
    })
    return statuses[0] || null
  }

  async findPendingIngestions(): Promise<IngestionStatus[]> {
    return this.find({
      where: { status: IngestionStatusEnum.PENDING },
      order: { createdAt: 'ASC' },
    })
  }
}
