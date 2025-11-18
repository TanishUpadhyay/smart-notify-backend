/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { CONFIG_DICTIONARY } from 'src/config/constants';
import { ConfigService } from '@nestjs/config';
import { TokensService } from 'src/tokens/tokens.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
    private tokenService: TokensService
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
      scope: [
        'email',
        'profile',
        'openid',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      prompt: 'consent',
      accessType: 'offline'
      //passReqToCallback: true
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    console.log('Google profile:', profile);
    const { name, emails, photos } = profile;
    const user = await this.authService.validateGoogleUser({
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      profilePicture: photos[0]?.value,
      googleId: profile.id
    });
    console.log('Validated Google user:', user);
    const token = await this.tokenService.saveToken({
      user,
      provider: 'google',
      accessToken,
      refreshToken,
      expiryDate: new Date(Date.now() + 3600 * 1000) // assuming 1 hour expiry
    });
    if (!token) {
      console.error('Failed to save Google token for user:', user.id);
      throw new Error('Failed to save Google token');
    }
    done(null, user);
  }
}
