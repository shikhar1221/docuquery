import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'

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
      AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}