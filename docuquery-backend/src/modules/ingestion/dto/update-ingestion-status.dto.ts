// dto/update-ingestion-status.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator'
import { IngestionStatusEnum } from 'src/common/enums/ingestion-status.enum'

export class UpdateIngestionStatusDto {
  @ApiProperty({
    description: 'The ID of the ingestion status to update',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  id!: number

  @ApiProperty({
    description: 'The new status of the ingestion',
    enum: IngestionStatusEnum,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(IngestionStatusEnum, {
    message: 'Status must be a valid ingestion status enum value',
  })
  status!: IngestionStatusEnum

  @ApiProperty({
    description: 'Error message if ingestion failed',
    required: true,
    nullable: true,
    default: null,
  })
  @IsNotEmpty()
  @IsString()
  error: string | null = null

  @ApiProperty({
    description: 'Optional metadata about the ingestion',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>
}
