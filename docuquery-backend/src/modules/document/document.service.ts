import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CreateDocumentDto } from './dto/create-document.dto'
import { UpdateDocumentDto } from './dto/update-document.dto'
import { Multer } from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path, { extname } from 'path'
import * as fs from 'fs'
import { ConfigService } from '@nestjs/config'
import { DocumentRepository } from 'src/common/repositories/document.repository'
import { UserRepository } from 'src/common/repositories/user.repository'
import { DocumentEntity } from 'src/common/entities/document.entity'

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name)
  private readonly configService = new ConfigService()

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly userRepository: UserRepository, // Inject UserRepository
  ) {}

  async create(createDocumentDto: CreateDocumentDto, file: Multer.File): Promise<DocumentEntity> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed')
    }
    try {
      let doc: DocumentEntity = new DocumentEntity()
      const fileName = `${uuidv4()}${extname(file.originalname)}`
      const uploadPath = path.resolve(this.configService.get<string>('UPLOAD_DIRECTORY') || './uploads')
      const absoluteFilePath = path.join(uploadPath, fileName)
      await this.saveFile(file, absoluteFilePath)
      doc.title = createDocumentDto.title!
      doc.description = createDocumentDto.description!
      doc.filePath = absoluteFilePath
      doc.fileName = fileName
      doc.mimeType = file.mimetype
      doc.size = file.size
      doc.uploadDate = new Date()
      doc.metadata = {
        file: {
          name: file.originalname,
          path: file.path,
          size: file.size,
          type: file.mimetype,
        },
      }
      let document: DocumentEntity

      // Update the user's document list
      const user = await this.userRepository.findOneById(createDocumentDto.userId!)
      if (user) {
        if (!user.documents) {
          user.documents = []
        }
        doc.user = user
        document = await this.documentRepository.createDocument(doc)
        user.documents.push(document)
        await this.userRepository.repository.save(user)
      }

      this.logger.log(`Document created with ID: ${document!.id}`)
      return document!
    } catch (error) {
      this.logger.error('Error creating document:', error)
      throw error
    }
  }

  async findAll(query: any): Promise<DocumentEntity[]> {
    try {
      const documents = await this.documentRepository.findAll(query)
      this.logger.log(`Fetched ${documents.length} documents`)
      return documents
    } catch (error) {
      this.logger.error('Error fetching documents:', error)
      throw error
    }
  }

  async findOne(id: string): Promise<DocumentEntity> {
    try {
      const document = await this.documentRepository.findOneById(id)
      if (!document) {
        throw new Error(`Document with ID ${id} not found`)
      }
      this.logger.log(`Fetched document with ID: ${id}`)
      return document
    } catch (error) {
      this.logger.error('Error fetching document:', error)
      throw error
    }
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, file?: Multer.File): Promise<DocumentEntity> {
    try {
      const document = await this.findOne(id)
      if (updateDocumentDto.title) document.title = updateDocumentDto.title
      if (updateDocumentDto.description) document.description = updateDocumentDto.description

      if (file) {
        const fileName = `${uuidv4()}${extname(file.originalname)}`
        const uploadPath = path.resolve(this.configService.get<string>('UPLOAD_DIRECTORY') || './uploads')
        const absoluteFilePath = path.join(uploadPath, fileName)
        await this.saveFile(file, absoluteFilePath)
        document.fileName = fileName
        document.filePath = absoluteFilePath
        document.mimeType = file.mimetype
        document.size = file.size
        document.uploadDate = new Date()
        document.metadata = {
          ...document.metadata,
          file: {
            name: file.originalname,
            path: fileName,
            size: file.size,
            type: file.mimetype,
          },
        }
      }

      const updatedDocument = await this.documentRepository.updateDocument(id, document)
      this.logger.log(`Updated document with ID: ${id}`)
      return updatedDocument
    } catch (error) {
      this.logger.error('Error updating document:', error)
      throw error
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log(`Attempting to remove document with ID: ${id}`);
      const document = await this.findOneDocumentByIdWithUser(id)
      this.logger.log(`Document found: ${JSON.stringify(document)}`);
      if (!document) {
        throw new Error(`Document with ID ${id} not found`)
      }

      // Find the user associated with the document
      if (document.user) {
        this.logger.log(`Document user found: ${JSON.stringify(document.user)}`);
        const user = await this.userRepository.findOneById(document.user.id.toString())
        if (user) {
        // Remove the document from the user's document list
        if (user.documents && Array.isArray(user.documents)) {
          user.documents = user.documents.filter((doc) => doc.id !== document.id)
          await this.userRepository.repository.save(user)
        } else {
          this.logger.warn('User documents is not defined, cannot filter document removal')
        }

        }

      }

        // Delete associated ingestion status entries
        await this.documentRepository.repository
          .createQueryBuilder()
          .delete()
          .from('ingestion_status')
          .where('documentId = :documentId', { documentId: document.id })
          .execute()

        // Remove the document itself
        await this.documentRepository.removeDocument(id)
        this.logger.log(`Deleted document with ID: ${id}`)
    } catch (error) {
      this.logger.error('Error deleting document:', error)
      throw error
    }
  }

  async downloadFile(id: string): Promise<any> {
    try {
      const document = await this.findOne(id)
      if (!document || !document.metadata.file) {
        throw new Error(`File for document with ID ${id} not found`)
      }
      return {
        name: document.fileName,
        path: document.filePath,
        type: document.mimeType,
      }
    } catch (error) {
      this.logger.error('Error downloading file:', error)
      throw error
    }
  }

  private async saveFile(file: Multer.File, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(path)
      writeStream.on('finish', () => resolve())
      writeStream.on('error', (error) => reject(error))
      writeStream.end(file.buffer)
    })
  }

  private async findOneDocumentByIdWithUser(id: string): Promise<DocumentEntity | null> {
    return this.documentRepository.repository.findOne({
      where: { id: parseInt(id) },
      relations: ['user'], // <-- Ensures the user object is loaded
    })
  }
}
