import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Query,
  Res,
} from '@nestjs/common'
import { Request as ExpressRequest } from 'express'
import { Response } from 'express'
import { Multer } from 'multer'
import { CreateDocumentDto } from './dto/create-document.dto'
import { UpdateDocumentDto } from './dto/update-document.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { HttpException } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import * as path from 'path'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { PermissionsGuard } from 'src/common/guards/permissions.guard'
import { DocumentService } from './document.service'
import { Role } from 'src/common/enums/roles.enum'
import { Roles } from 'src/common/decorators/roles.decorator'
import { Permissions } from'src/common/decorators/permissions.decorator'
import { Permission } from 'src/common/enums/permissions.enum'
import { DocumentEntity } from 'src/common/entities/document.entity'

@ApiTags('Document Management APIs')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Roles(Role.Admin, Role.Editor)
  @Permissions(Permission.DOCUMENTS_CREATE)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true)
        } else {
          cb(new HttpException('Only PDF files are allowed!', 400), false)
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Create a new document with file upload' })
  @ApiResponse({ status: 201, description: 'The document has been successfully created.', type: DocumentEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @UploadedFile() file: Multer.File,
    @Body() body: { title: string; description: string },
    @Req() req: ExpressRequest & { user?: any },
  ) {
    try {
      let createDocumentDto = new CreateDocumentDto()
      const { title, description } = body
      createDocumentDto.title = title
      createDocumentDto.description = description
      createDocumentDto.userId = req.user.sub
      console.log(createDocumentDto)
      return await this.documentService.create(createDocumentDto, file)
    } catch (error) {
      throw new HttpException('Failed to create document', 500)
    }
  }

  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  @Permissions(Permission.DOCUMENTS_READ)
  @Get()
  @ApiOperation({ summary: 'Get all documents with pagination, filtering, and sorting' })
  @ApiResponse({ status: 200, description: 'Return all documents.', type: [DocumentEntity] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query() query: any) {
    try {
      return await this.documentService.findAll(query)
    } catch (error) {
      throw new HttpException('Failed to fetch documents', 500)
    }
  }

  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  @Permissions(Permission.DOCUMENTS_READ)
  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({ status: 200, description: 'Return the document.', type: DocumentEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.documentService.findOne(id)
    } catch (error) {
      throw new HttpException('Failed to fetch document', 500)
    }
  }

  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  @Permissions(Permission.DOCUMENTS_READ, Permission.DOCUMENTS_DOWNLOAD)
  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document file by ID' })
  @ApiResponse({ status: 200, description: 'The document file has been successfully downloaded.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async download(@Param('id') id: string, @Res() res: Response) {
    try {
      const file = await this.documentService.downloadFile(id)
      const absolutePath = path.resolve(file.path)
      res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`)
      res.setHeader('Content-Type', file.type)
      res.sendFile(absolutePath)
    } catch (error) {
      throw new HttpException('Failed to download document', 500)
    }
  }

  @Roles(Role.Admin, Role.Editor)
  @Permissions(Permission.DOCUMENTS_UPDATE)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true)
        } else {
          cb(new HttpException('Only PDF files are allowed!', 400), false)
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        documentId: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a document by ID' })
  @ApiResponse({ status: 200, description: 'The document has been successfully updated.', type: DocumentEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(
    @UploadedFile() file: Multer.File,
    @Body() body: { title: string; description: string; documentId: string },
    @Req() req: ExpressRequest & { user?: any },
  ) {
    try {
      const updateDocumentDto = new UpdateDocumentDto()
      const { title, description, documentId } = body
      updateDocumentDto.title = title
      updateDocumentDto.description = description
      updateDocumentDto.documentId = documentId
      updateDocumentDto.userId = req.user.sub
      return await this.documentService.update(documentId, updateDocumentDto, file)
    } catch (error) {
      throw new HttpException('Failed to update document', 500)
    }
  }

  @Roles(Role.Admin)
  @Permissions(Permission.DOCUMENTS_DELETE)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiResponse({ status: 200, description: 'The document has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async remove(@Param('id') id: string) {
    console.log('id', id)

    try {
      await this.documentService.remove(id)
      return { message: 'Document deleted successfully' }
    } catch (error) {
      throw new HttpException('Failed to delete document', 500)
    }
  }
}
