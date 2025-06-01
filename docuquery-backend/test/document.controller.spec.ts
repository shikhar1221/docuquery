import { Test, TestingModule } from '@nestjs/testing'
import { Multer } from 'multer'
import { Response } from 'express'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { DocumentController } from 'src/modules/document/document.controller';
import { DocumentService } from 'src/modules/document/document.service';
import { UserEntity } from 'src/common/entities/user.entity';
import { Role } from 'src/common/enums/roles.enum';
import { RefreshTokenEntity } from 'src/common/entities/refresh-token.entity';
import { DocumentEntity } from 'src/common/entities/document.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { CreateDocumentDto } from 'src/modules/document/dto/create-document.dto';
import { UpdateDocumentDto } from 'src/modules/document/dto/update-document.dto';

describe('DocumentController', () => {
  let controller: DocumentController;
  let documentService: DocumentService;

  const mockUser: UserEntity = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    roles: [Role.Viewer],
    tokens: [] as RefreshTokenEntity[],
    permissions: {
      DOCUMENTS_CREATE: true,
      DOCUMENTS_READ: true,
      DOCUMENTS_UPDATE: false,
      DOCUMENTS_DELETE: false,
    },
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    setDefaultPermissions: jest.fn(),
    hasPermission: jest.fn(),
  }

  const mockDocument: DocumentEntity = {
    id: 1,
    title: 'Test Document',
    description: 'Test Description',
    filePath: '/uploads/test.pdf',
    fileName: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    uploadDate: new Date(),
    user: mockUser, // Changed from null to mockUser
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockDocument),
            findAll: jest.fn().mockResolvedValue([mockDocument]),
            findOne: jest.fn().mockResolvedValue(mockDocument),
            update: jest.fn().mockResolvedValue(mockDocument),
            remove: jest.fn().mockResolvedValue(undefined),
            downloadFile: jest.fn().mockResolvedValue({
              path: '/uploads/test.pdf',
              name: 'test.pdf',
              type: 'application/pdf',
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    documentService = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'Test Description',
        userId: '1',
      }

      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Multer.File

      const mockRequest = {
        user: { sub: '1' },
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        // Add other required Express Request methods as needed
      } as unknown as Request

      const result = await controller.create(
        mockFile,
        { title: 'Test Document', description: 'Test Description' },
        mockRequest,
      )
      expect(result).toEqual(mockDocument)
      expect(documentService.create).toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const result = await controller.findAll({})
      expect(result).toEqual([mockDocument])
      expect(documentService.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a single document', async () => {
      const result = await controller.findOne('1')
      expect(result).toEqual(mockDocument)
      expect(documentService.findOne).toHaveBeenCalledWith('1')
    })
  })

  describe('update', () => {
    it('should update a document', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Document',
        description: 'Updated Description',
        documentId: '1',
        userId: '1',
      }

      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Multer.File

      const mockRequest = {
        user: { sub: '1' },
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        // Add other required Express Request methods as needed
      } as unknown as Request

      const result = await controller.update(
        mockFile,
        { title: 'Updated Document', description: 'Updated Description', documentId: '1' },
        mockRequest,
      )
      expect(result).toEqual(mockDocument)
      expect(documentService.update).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should delete a document', async () => {
      await controller.remove('1')
      expect(documentService.remove).toHaveBeenCalledWith('1')
    })
  })

  describe('download', () => {
    it('should download a document file', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        sendFile: jest.fn(),
      } as unknown as Response

      await controller.download('1', mockResponse)
      expect(documentService.downloadFile).toHaveBeenCalledWith('1')
      expect(mockResponse.setHeader).toHaveBeenCalledTimes(2)
      expect(mockResponse.sendFile).toHaveBeenCalled()
    })
  })
})
