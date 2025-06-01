import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { DocumentEntity } from '../entities/document.entity'
import { CreateDocumentDto } from '../../modules/document/dto/create-document.dto'
import { UpdateDocumentDto } from '../../modules/document/dto/update-document.dto'

@Injectable()
export class DocumentRepository {
  repository: Repository<DocumentEntity>
  private readonly logger = new Logger(DocumentRepository.name)

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(DocumentEntity)
  }

  async createDocument(doc: DocumentEntity): Promise<DocumentEntity> {
    try {
      const document = this.repository.create(doc)
      return await this.repository.save(document)
    } catch (error: any) {
      this.logger.error('Error creating document', error.stack)
      throw error
    }
  }

  async updateDocument(id: string, updateDocumentDto: UpdateDocumentDto): Promise<DocumentEntity> {
    const document = await this.repository.findOne({ where: { id: parseInt(id) } })
    if (!document) {
      throw new Error('Document not found')
    }
    this.repository.merge(document, updateDocumentDto)
    return this.repository.save(document)
  }

  async findAll(query: any): Promise<DocumentEntity[]> {
    const { page = 1, limit = 10, filter, sort } = query
    const queryBuilder = this.repository.createQueryBuilder('document')

    if (filter) {
      Object.keys(filter).forEach((key) => {
        queryBuilder.andWhere(`document.${key} LIKE :${key}`, { [key]: `%${filter[key]}%` })
      })
    }

    if (sort) {
      const [sortField, sortOrder] = sort.split(':')
      queryBuilder.orderBy(`document.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
    }

    queryBuilder.skip((page - 1) * limit).take(limit)

    return queryBuilder.getMany()
  }

  async findOneById(id: string): Promise<DocumentEntity | null> {
    return this.repository.findOne({ where: { id: parseInt(id) } })
  }

  async removeDocument(id: string): Promise<DocumentEntity> {
    const document = await this.repository.findOne({
      where: { id: parseInt(id) },
      relations: ['user'],
    })

    if (!document) {
      this.logger.error(`Document with ID ${id} not found`)
      throw new NotFoundException('Document not found')
    }

    return this.repository.remove(document)
  }
}
