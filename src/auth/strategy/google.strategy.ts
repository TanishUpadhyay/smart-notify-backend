/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { CONFIG_DICTIONARY } from 'src/config/constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService
  ) {
    const clientID = configService.get<string>(
      CONFIG_DICTIONARY.GOOGLE_CLIENT_ID
    );
    const clientSecret = configService.get<string>(
      CONFIG_DICTIONARY.GOOGLE_CLIENT_SECRET
    );
    const callbackURL = configService.get<string>(
      CONFIG_DICTIONARY.GOOGLE_CALLBACK_URL
    );

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth configuration');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const user = await this.authService.validateGoogleUser(profile);
    done(null, user);
  }
}
