import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  ParseIntPipe,
  HttpException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UpdateIngestionStatusDto } from './dto/update-ingestion-status.dto'
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { PermissionsGuard } from 'src/common/guards/permissions.guard'
import { IngestionService } from './ingestion.service'
import { Roles } from 'src/common/decorators/roles.decorator'
import { Role } from 'src/common/enums/roles.enum'
import { Permission } from 'src/common/enums/permissions.enum'
import { Permissions } from'src/common/decorators/permissions.decorator'

@Controller('ingestion')
@ApiTags('Document Ingestion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @Roles(Role.Admin, Role.Editor)
  @Permissions(Permission.INGESTION_TRIGGER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger document ingestion process' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Ingestion process started' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document not found' })
  async triggerIngestion(@Body(ValidationPipe) triggerIngestionDto: TriggerIngestionDto): Promise<void> {
    const { documentId } = triggerIngestionDto
    await this.ingestionService.triggerIngestion(documentId.toString())
  }

  @Get(':documentId')
  @Roles(Role.Admin, Role.Editor, Role.Viewer)
  @Permissions(Permission.INGESTION_STATUS)
  @ApiOperation({ summary: 'Get ingestion status for a document' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the ingestion status' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document not found' })
  async getIngestionStatus(@Param('documentId', ParseIntPipe) documentId: number) {
    return this.ingestionService.getIngestionStatus(documentId.toString())
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook endpoint for Python backend' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request payload' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ingestion status not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Failed to update ingestion status' })
  async updateIngestionStatus(@Body(ValidationPipe) payload: UpdateIngestionStatusDto): Promise<void> {
    try {
      await this.ingestionService.updateIngestionStatus(payload.id, payload.status, payload.error)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to update ingestion status', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
