import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate } from 'class-validator'

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: 'Title of the document' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ description: 'Description of the document' })
  @IsOptional()
  @IsString()
  description?: string

  userId?: string

  documentId?: string
}
