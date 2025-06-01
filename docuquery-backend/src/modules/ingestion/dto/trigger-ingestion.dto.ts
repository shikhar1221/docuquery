import { IsNotEmpty, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Data Transfer Object for triggering the ingestion process of a document.
 * This DTO encapsulates the documentId that uniquely identifies the document to be ingested.
 */
export class TriggerIngestionDto {
  /**
   * Unique identifier of the document to be ingested.
   * This value must be a non-empty number.
   */
  @ApiProperty({
    description: 'Unique identifier of the document that needs to be ingested',
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  documentId!: number
}
