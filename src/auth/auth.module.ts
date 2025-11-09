import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { CONFIG_DICTIONARY } from '../config/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(CONFIG_DICTIONARY.JWT_SECRET),
        signOptions: {
          expiresIn: configService.get(CONFIG_DICTIONARY.JWT_EXPIRES_IN)
        }
      })
    })
  ],
  providers: [
    AuthService,
    LocalStrategy,
    GoogleStrategy,
    {
      provide: JwtStrategy,
      useFactory: (
        usersService: UsersService,
        configService: ConfigService
      ) => {
        return new JwtStrategy(usersService, {
          secret:
            configService.get<string>(CONFIG_DICTIONARY.JWT_SECRET) ||
            'defaultSecret'
        });
      },
      inject: [UsersService, ConfigService]
    }
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
