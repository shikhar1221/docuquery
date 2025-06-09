// src/userManagement/userManagement.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './userManagement.controller'
import { UserService } from './userManagement.service'
import { UserEntity } from '../../common/entities/user.entity'
import { UserRepository } from '../../common/repositories/user.repository'
import { RolesGuard } from '../../common/guards/roles.guard'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UserController],
  providers: [UserService, RolesGuard, UserRepository],
  exports: [UserService],
})
export class UserManagementModule {}
