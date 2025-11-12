/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  GoogleUserData,
  IAuthenticationService
} from './interface/auth-interface';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from './dto/registerDTO';
import { AuthProvider, UserEntity } from 'src/users/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { InjectLogger } from 'src/common/Logger';
import { Logger } from 'winston';
import { OAuth2Client } from 'google-auth-library';
import { CONFIG_DICTIONARY } from 'src/config/constants';

@Injectable()
export class AuthService implements IAuthenticationService {
  private readonly oauth2client: OAuth2Client;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectLogger() private readonly logger: Logger
  ) {
    this.oauth2client = new OAuth2Client({
      clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('GOOGLE_REDIRECT_URI')
    });
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    try {
      //find user from email
      const user = await this.usersService.getUserByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        if (!user.emailVerified) {
          throw new UnauthorizedException('Email not verified');
        }
        this.logger.debug(`User ${email} authenticated successfully.`);
        return user;
      } else {
        this.logger.debug(`Authentication failed for user ${email}.`);
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      this.logger.error(`Error validating user: ${error}`);
      throw new Error('Error validating user');
    }
  }

  async login(user: UserEntity): Promise<{ access_token: string }> {
    try {
      //update last login
      await this.usersService.updateLastLogin(user.id.toString());
      this.logger.debug(`Generating JWT token for user ${user.email}.`);
      const payload = { username: user.email, sub: user.id };
      return {
        access_token: await this.jwtService.signAsync(payload)
      };
    } catch (error) {
      this.logger.error(`Error during login: ${error}`);
      throw new Error('Error during login');
    }
  }

  async register(registerDto: RegisterDTO): Promise<UserEntity> {
    this.logger.debug(`Registering new user with email ${registerDto.email}.`);
    try {
      //first check if user already exists
      const existingUser = await this.usersService.getUserByEmail(
        registerDto.email.toLowerCase()
      );
      if (existingUser) {
        this.logger.debug(
          `Registration failed: User with email ${registerDto.email} already exists.`
        );
        //TODO:Later add logic to send verification email if not verified

        throw new ConflictException('User already exists');
      }
      const newUser = await this.usersService.createUser(registerDto);
      //TODO: Later send verification email
      this.logger.debug(`User ${newUser.email} registered successfully.`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error during registration: ${error}`);
      throw new Error('Error during registration');
    }
  }

  async validateGoogleUser(googleData: GoogleUserData): Promise<UserEntity> {
    this.logger.debug(`Validating Google user with email ${googleData.email}.`);
    try {
      //first find and check if googleId is already present
      let user = await this.usersService.getUserWithGoogleId(
        googleData.googleId
      );
      if (!user) {
        //check if user already exists
        user = await this.usersService.getUserByEmail(googleData.email);
        if (!user) {
          //create new user
          this.logger.debug(
            `No existing user found. Creating new user for email ${googleData.email}.`
          );

          user = await this.usersService.createUser({
            email: googleData.email,
            firstName: googleData.firstName,
            lastName: googleData.lastName,
            profilePicture: googleData.profilePicture,
            googleId: googleData.googleId,
            emailVerified: true,
            authProvider: AuthProvider.GOOGLE
          });
        } else {
          this.logger.debug(
            `Existing user found for email ${googleData.email}. Linking Google ID.`
          );
          //update user with googleId
          user = await this.usersService.updateUserGoogleInfo(
            user.id,
            googleData.googleId,
            AuthProvider.GOOGLE
          );
        }

        this.logger.debug(`User ${user.email} validated successfully.`);
      } else {
        this.logger.debug(
          `Existing user with googleId found for :${user.email}.`
        );
      }
      return user;
    } catch (error) {
      this.logger.error(`Error validating Google user: ${error}`);
      throw new Error('Error validating Google user');
    }
  }

  async loginWithGoogleAuthCode(authCode: string): Promise<{ token: string }> {
    this.logger.debug('Processing Google auth code login');

    try {
      // Exchange auth code for tokens
      const { tokens } = await this.oauth2client.getToken(authCode);

      if (!tokens.id_token) {
        throw new UnauthorizedException('No ID token received from Google');
      }

      // Verify the ID token
      const ticket = await this.oauth2client.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.configService.get<string>(
          CONFIG_DICTIONARY.GOOGLE_CLIENT_ID
        )
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google ID token');
      }

      if (!payload.email_verified) {
        throw new UnauthorizedException('Google email not verified');
      }

      // Map Google user data
      const googleUserData: GoogleUserData = {
        email: payload.email!,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        profilePicture: payload.picture,
        googleId: payload.sub
      };

      // Validate or create user
      const user = await this.validateGoogleUser(googleUserData);

      // Generate application JWT
      const result = await this.login(user);

      return { token: result.access_token };
    } catch (error) {
      this.logger.error(
        `Google auth code login failed: ${error.message}`,
        error.stack
      );
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }
  // forgotPassword(email: string): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
  // resetPassword(token: string, newPassword: string): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
}
