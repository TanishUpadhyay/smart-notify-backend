import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/env.validation';
import winston from 'winston';
import { CONFIG_DICTIONARY } from './config/constants';
import { WinstonModule } from 'nest-winston';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true, validate }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        levels: {
          critical: 0,
          analytics: 1,
          error: 2,
          warn: 3,
          info: 4,
          debug: 5,
          trace: 6
        },
        transports: [
          new winston.transports.Console({
            level: configService.get<string>(CONFIG_DICTIONARY.LOG_LEVEL),
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            )
          })
        ]
      })
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(CONFIG_DICTIONARY.POSTGRES_HOST),
        port: configService.get<number>(CONFIG_DICTIONARY.POSTGRES_PORT),
        username: configService.get<string>(CONFIG_DICTIONARY.POSTGRES_USER),
        password: configService.get<string>(
          CONFIG_DICTIONARY.POSTGRES_PASSWORD
        ),
        database: configService.get<string>(CONFIG_DICTIONARY.POSTGRES_DB),
        entities: [__dirname + '/**/entity/*.entity{.ts,.js}'],
        synchronize: true
        // configService.get<string>(CONFIG_DICTIONARY.NODE_ENV) == 'local'
        // ssl:
        //   configService.get<string>(CONFIG_DICTIONARY.NODE_ENV) !== 'local'
        //     ? {
        //         rejectUnauthorized: true,
        //         ca: fs.readFileSync('./assets/ap-south-1-bundle.pem')
        //       }
        //     : null
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
