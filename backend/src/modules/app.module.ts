import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UserManagementModule } from './userManagement/userManagement.module'
import { DocumentModule } from './document/document.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [

    ConfigModule.forRoot({
        isGlobal: true,
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
          autoLoadEntities: true,
        }),
      }),
      LoggerModule,
      AuthModule,
      UserManagementModule,
      DocumentModule,
      IngestionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}