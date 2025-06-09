import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { HttpException, Logger } from '@nestjs/common'
import { of, throwError } from 'rxjs'
import { AxiosResponse, AxiosRequestHeaders } from 'axios'
import { IngestionService } from 'src/modules/ingestion/ingestion.service'
import { DocumentService } from 'src/modules/document/document.service'
import { IngestionStatusRepository } from 'src/common/repositories/ingestion-status.repository'
import { DocumentEntity } from 'src/common/entities/document.entity'
import { IngestionStatus } from 'src/common/entities/ingestion-status.entity'
import { IngestionStatusEnum } from 'src/common/enums/ingestion-status.enum'

describe('IngestionService', () => {
  let service: IngestionService
  let httpService: HttpService
  let configService: ConfigService
  let documentService: DocumentService
  let ingestionStatusRepository: IngestionStatusRepository
  let logger: Logger

  const mockDocument: Partial<DocumentEntity> = {
    id: 1,
    fileName: 'test.pdf',
    filePath: '/uploads/test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    title: 'Test Document',
  }

  const mockIngestionStatus: Partial<IngestionStatus> = {
    id: 1,
    documentId: 1,
    status: IngestionStatusEnum.PENDING,
    startedAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      fileName: 'test.pdf',
      filePath: '/uploads/test.pdf',
    },
  }

  const mockAxiosResponse: AxiosResponse = {
    data: { status: 'success' },
    status: 200,
    statusText: 'OK',
    headers: {},
    // Cast headers to AxiosRequestHeaders to satisfy TS requirements
    config: { headers: {} as AxiosRequestHeaders },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
        {
          provide: DocumentService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: IngestionStatusRepository,
          useValue: {
            save: jest.fn(),
            findLatestByDocumentId: jest.fn(),
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<IngestionService>(IngestionService)
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
    documentService = module.get<DocumentService>(DocumentService)
    ingestionStatusRepository = module.get<IngestionStatusRepository>(IngestionStatusRepository)
    logger = module.get<Logger>(Logger)
  })

  describe('triggerIngestion', () => {
    it('should successfully trigger document ingestion', async () => {
      const documentId = '1';
      jest.spyOn(httpService, 'post').mockReturnValueOnce(of(mockAxiosResponse));
      jest.spyOn(documentService, 'findOne').mockResolvedValueOnce(mockDocument as DocumentEntity);
      jest.spyOn(ingestionStatusRepository, 'save').mockResolvedValueOnce(mockIngestionStatus as IngestionStatus);

      const result = await service.triggerIngestion(documentId);

      expect(result).toBeDefined();
      expect(result.status).toBe(IngestionStatusEnum.PENDING);
      expect(ingestionStatusRepository.save).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should throw error if document not found', async () => {
      const documentId = '999'
      jest.spyOn(documentService, 'findOne').mockResolvedValueOnce(null as unknown as DocumentEntity)

      await expect(service.triggerIngestion(documentId)).rejects.toThrow(HttpException)
    })

    it('should handle Python backend communication failure', async () => {
      const documentId = '1'
      jest.spyOn(documentService, 'findOne').mockResolvedValueOnce(mockDocument as DocumentEntity)
      jest
        .spyOn(ingestionStatusRepository, 'save')
        .mockResolvedValueOnce(mockIngestionStatus as IngestionStatus)
      jest.spyOn(httpService, 'post').mockReturnValueOnce(throwError(() => new Error('Failed to connect')))

      await expect(service.triggerIngestion(documentId)).rejects.toThrow(HttpException)
    })
  })

  describe('updateIngestionStatus', () => {
    it('should successfully update ingestion status', async () => {
      const statusId = 1
      const updateData = {
        status: IngestionStatusEnum.COMPLETED,
        metadata: { completedAt: new Date() },
      }

      jest.spyOn(ingestionStatusRepository, 'findOneById').mockResolvedValueOnce(mockIngestionStatus as IngestionStatus)
      jest.spyOn(ingestionStatusRepository, 'save').mockResolvedValueOnce({
        ...mockIngestionStatus,
        ...updateData,
      } as IngestionStatus)

      const result = await service.updateIngestionStatus(
        statusId,
        updateData.status,
        null, // This is now properly typed as string | null
      )

      expect(result).toBeDefined()
      expect(result.status).toBe(IngestionStatusEnum.COMPLETED)
      expect(ingestionStatusRepository.save).toHaveBeenCalled()
    })
  })

  describe('getIngestionStatus', () => {
    it('should return ingestion status for document', async () => {
      const documentId = 1;
      jest.spyOn(ingestionStatusRepository, 'findLatestByDocumentId')
        .mockResolvedValueOnce(mockIngestionStatus as IngestionStatus);

      const result = await service.getIngestionStatus(documentId.toString());

      expect(result).toBeDefined();
      expect(result.documentId).toBe(documentId);
      expect(ingestionStatusRepository.findLatestByDocumentId).toHaveBeenCalledWith(documentId);
    });
  });
});
