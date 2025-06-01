import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserEntity } from '../../common/entities/user.entity'
import { RefreshTokenEntity } from '../../common/entities/refresh-token.entity'
import { UserRepository } from '../../common/repositories/user.repository'
import { TokenRepository } from '../../common/repositories/token.repository'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { RolesGuard } from '../../common/guards/roles.guard'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your_jwt_secret',
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [UserRepository, TokenRepository, AuthService, JwtStrategy, JwtAuthGuard, PermissionsGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule, PermissionsGuard, RolesGuard],
})
export class AuthModule {}
