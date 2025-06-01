// src/document/document.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DocumentController } from './document.controller'
import { AuthModule } from '../auth/auth.module'
import { DocumentEntity } from 'src/common/entities/document.entity'
import { UserEntity } from 'src/common/entities/user.entity'
import { DocumentService } from './document.service'
import { DocumentRepository } from 'src/common/repositories/document.repository'
import { UserRepository } from 'src/common/repositories/user.repository'

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, UserEntity]), AuthModule],
  controllers: [DocumentController],
  providers: [DocumentService, DocumentRepository, UserRepository],
  exports: [DocumentService],
})
export class DocumentModule {}
