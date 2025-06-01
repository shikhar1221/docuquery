import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HttpModule } from '@nestjs/axios'
import { IngestionController } from './ingestion.controller'
import { IngestionService } from './ingestion.service'
import { DocumentModule } from '../document/document.module'
import { AuthModule } from '../auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { IngestionStatus } from 'src/common/entities/ingestion-status.entity'
import { IngestionStatusRepository } from 'src/common/repositories/ingestion-status.repository'

@Module({
  imports: [TypeOrmModule.forFeature([IngestionStatus]), HttpModule, DocumentModule, AuthModule, ConfigModule],
  controllers: [IngestionController],
  providers: [IngestionService, IngestionStatusRepository],
  exports: [IngestionService],
})
export class IngestionModule {}
