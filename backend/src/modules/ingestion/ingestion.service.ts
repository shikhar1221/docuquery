import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { HttpException, HttpStatus } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { timeout, catchError } from 'rxjs/operators'
import { of } from 'rxjs'
import { AxiosError } from 'axios'
import { DocumentService } from '../document/document.service'
import { IngestionStatusRepository } from 'src/common/repositories/ingestion-status.repository'
import { IngestionStatus } from 'src/common/entities/ingestion-status.entity'
import { IngestionStatusEnum } from 'src/common/enums/ingestion-status.enum'

interface IngestionMetadata {
  retryCount: number
  startTime: string
  lastChecked?: string
  lastRetry?: string
  fileName?: string
  filePath?: string
  mimeType?: string
  size?: number
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name)
  private readonly pythonBackendTimeout = 5000
  private readonly maxRetries = 3

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly documentService: DocumentService,
    private readonly ingestionStatusRepository: IngestionStatusRepository,
  ) {}

  async triggerIngestion(documentId: string): Promise<IngestionStatus> {
    try {
      const numericDocId = parseInt(documentId, 10);
      const document = await this.documentService.findOne(documentId);
      
      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      console.log(`Triggering ingestion for document: ${documentId}`);
      const ingestionStatus = await this.ingestionStatusRepository.save({
        documentId: numericDocId,
        status: IngestionStatusEnum.PENDING,
        metadata: {
          retryCount: 0,
          startTime: new Date().toISOString(),
          fileName: document.fileName,
          filePath: document.filePath,
          mimeType: document.mimeType,
          size: document.size,
        } as IngestionMetadata,
        startedAt: new Date(),
      });

      const pythonBackendUrl = this.configService.get<string>('PYTHON_BACKEND_URL');
      if (!pythonBackendUrl) {
        throw new HttpException('Python backend URL not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }

      const response$ = this.httpService.post(`${pythonBackendUrl}/ingest`, {
        documentId: numericDocId,
        ingestionId: ingestionStatus.id,
        filePath: document.filePath,
        metadata: {
          fileName: document.fileName,
          filePath: document.filePath,
          mimeType: document.mimeType,
          size: document.size,
        },
      }).pipe(
        timeout(this.pythonBackendTimeout),
        catchError((error: AxiosError) => {
          this.logger.error(`Failed to notify Python backend: ${error.message}`);
          throw new HttpException('Failed to communicate with Python backend', HttpStatus.SERVICE_UNAVAILABLE);
        }),
      );

      await firstValueFrom(response$);
      return ingestionStatus;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to trigger ingestion: ${(error as Error).message}`);
      throw new HttpException('Failed to trigger document ingestion', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getIngestionStatus(documentId: string): Promise<IngestionStatus> {
    try {
      const numericDocId = parseInt(documentId, 10)
      if (isNaN(numericDocId)) {
        throw new HttpException('Invalid document ID format', HttpStatus.BAD_REQUEST)
      }

      const status = await this.ingestionStatusRepository.findLatestByDocumentId(numericDocId)

      if (!status) {
        this.logger.warn(`No ingestion status found for document ID: ${documentId}`)
        throw new HttpException('Ingestion status not found', HttpStatus.NOT_FOUND)
      }

      if (this.isStatusFinal(status.status)) {
        return status
      }

      const pythonBackendUrl = this.configService.get<string>('PYTHON_BACKEND_URL')
      if (!pythonBackendUrl) {
        this.logger.warn('Python backend URL not configured, using local status')
        return status
      }

      try {
        const response = await firstValueFrom(
          this.httpService
            .get<{
              status: IngestionStatusEnum
              metadata: Record<string, any>
              error?: string
            }>(`${pythonBackendUrl}/status/${status.id}`)
            .pipe(
              timeout(this.pythonBackendTimeout),
              catchError((error: AxiosError) => {
                this.logger.warn(`Failed to get status from Python backend: ${error.message}`)
                return of({
                  data: {
                    status: status.status,
                    metadata: status.metadata,
                    error: 'Failed to fetch status from Python backend',
                  },
                })
              }),
            ),
        )

        if (response.data.status !== status.status) {
          this.logger.log(`Status changed from ${status.status} to ${response.data.status} for document ${documentId}`)

          const updatedStatus = await this.updateStatus(status.id, {
            status: response.data.status,
            metadata: {
              ...status.metadata,
              ...(response.data.metadata || {}),
              lastChecked: new Date().toISOString(),
            },
            error: response.data.error,
          })

          if (updatedStatus.status === IngestionStatusEnum.FAILED && this.canRetry(updatedStatus)) {
            this.logger.log(
              `Retrying failed ingestion for document ${documentId}, attempt ${(updatedStatus.metadata?.retryCount || 0) + 1}`,
            )
            return this.retryIngestion(updatedStatus)
          }

          return updatedStatus
        }
      } catch (httpError) {
        this.logger.error(`HTTP error while checking status: ${(httpError as Error).message}`)
        // Continue with local status if HTTP request fails
      }

      return status
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error(`Failed to get ingestion status: ${(error as Error).message}`, (error as Error).stack)
      throw new HttpException('Failed to get ingestion status', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateIngestionStatus(id: number, status: string, error: string | null): Promise<IngestionStatus> {
    try {
      if (isNaN(id)) {
        throw new HttpException('Invalid ingestion ID format', HttpStatus.BAD_REQUEST)
      }

      const ingestionStatus = await this.ingestionStatusRepository.findOneById(id)

      if (!ingestionStatus) {
        this.logger.warn(`Ingestion status not found for ID: ${id}`)
        throw new HttpException('Ingestion status not found', HttpStatus.NOT_FOUND)
      }

      // Validate status enum value
      if (status && !Object.values(IngestionStatusEnum).includes(status as IngestionStatusEnum)) {
        throw new HttpException(`Invalid status value: ${status}`, HttpStatus.BAD_REQUEST)
      }

      this.logger.log(`Updating ingestion status for ID: ${id}, Status: ${status}`)

      return this.updateStatus(id, {
        status: status as IngestionStatusEnum,
        error: error || undefined,
        updatedAt: new Date(),
      })
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error(`Failed to update ingestion status: ${(error as Error).message}`, (error as Error).stack)
      throw new HttpException('Failed to update ingestion status', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private isStatusFinal(status: IngestionStatusEnum): boolean {
    return status === IngestionStatusEnum.COMPLETED || status === IngestionStatusEnum.FAILED
  }

  private canRetry(status: IngestionStatus): boolean {
    return (status.metadata?.retryCount || 0) < this.maxRetries
  }

  private async updateStatus(ingestionId: number, update: Partial<IngestionStatus>): Promise<IngestionStatus> {
    try {
      return this.ingestionStatusRepository.save({
        id: ingestionId,
        ...update,
        updatedAt: new Date(),
      })
    } catch (error) {
      this.logger.error(`Failed to save ingestion status: ${(error as Error).message}`)
      throw new HttpException('Failed to save ingestion status', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async retryIngestion(status: IngestionStatus): Promise<IngestionStatus> {
    try {
      if (!this.canRetry(status)) {
        this.logger.warn(`Maximum retry attempts (${this.maxRetries}) reached for document ${status.documentId}`)
        return status
      }

      const retryCount = (status.metadata?.retryCount || 0) + 1
      this.logger.log(`Retrying ingestion for document ${status.documentId}, attempt ${retryCount}`)

      const updatedStatus = await this.updateStatus(status.id, {
        status: IngestionStatusEnum.PENDING,
        metadata: {
          ...(status.metadata || {}),
          retryCount,
          lastRetry: new Date().toISOString(),
        },
        error: null,
      })

      // Notify Python backend about the retry
      const pythonBackendUrl = this.configService.get<string>('PYTHON_BACKEND_URL')
      if (pythonBackendUrl) {
        try {
          await firstValueFrom(
            this.httpService
              .post(`${pythonBackendUrl}/retry`, {
                documentId: status.documentId,
                ingestionId: status.id,
              })
              .pipe(
                timeout(this.pythonBackendTimeout),
                catchError((error: AxiosError) => {
                  this.logger.warn(`Failed to notify Python backend about retry: ${error.message}`)
                  return of(null)
                }),
              ),
          )
        } catch (error) {
          this.logger.warn(`Error notifying Python backend about retry: ${(error as Error).message}`)
          // Continue even if notification fails
        }
      }

      return updatedStatus
    } catch (error) {
      this.logger.error(`Failed to retry ingestion: ${(error as Error).message}`)
      throw new HttpException('Failed to retry ingestion', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
