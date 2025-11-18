/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entity/token.entity';
import { UserEntity } from 'src/users/entity/user.entity';
import { InjectLogger } from 'src/common/Logger';
import { Logger } from 'winston';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly repo: Repository<Token>,
    @InjectLogger() private readonly logger: Logger,
    private readonly configService: ConfigService
  ) {}

  async saveToken(details: {
    user: UserEntity;
    provider: string;
    accessToken: string;
    refreshToken?: string;
    expiryDate?: Date;
  }) {
    this.logger.debug(
      `Saving token for user ${details.user.id} and provider ${details.provider}`
    );
    try {
      let token = await this.repo.findOne({
        where: { user: details.user, provider: details.provider }
      });

      if (!token) {
        token = this.repo.create(details);
      } else {
        token.accessToken = details.accessToken;
        token.refreshToken = details.refreshToken || token.refreshToken;
        token.expiryDate = details.expiryDate || token.expiryDate;
      }
      return this.repo.save(token);
    } catch (error) {
      this.logger.error(
        `Error saving token for user ${details.user.id} and provider ${details.provider}: ${error}`
      );
      throw error;
    }
  }

  async getToken(user: UserEntity, provider: string) {
    this.logger.debug(
      `Retrieving token for user ${user.id} and provider ${provider}`
    );
    try {
      const token = await this.repo.findOne({
        where: { user, provider }
      });
      if (!token) {
        this.logger.warn(
          `No token found for user ${user.id} and provider ${provider}`
        );
        return null;
      }

      return token;
    } catch (error) {
      this.logger.error(
        `Error retrieving token for user ${user.id} and provider ${provider}: ${error}`
      );
      throw error;
    }
  }

  //dont know if needed to delete token,later make it soft delete if needed
  async deleteToken(user: UserEntity, provider: string) {
    return this.repo.delete({ user, provider });
  }

  isExpired(token: Token): boolean {
    if (!token.expiryDate) return true;
    return token.expiryDate.getTime() < Date.now();
  }

  async refreshGoogleToken(token: Token): Promise<Token> {
    this.logger.debug(`Refreshing Google token for user ${token.user.id}`);
    try {
      if (!token.refreshToken) {
        throw new Error('No refresh token available');
      }

      const params = new URLSearchParams();
      params.append(
        'client_id',
        this.configService.get<string>('GOOGLE_CLIENT_ID') || ''
      );
      params.append(
        'client_secret',
        this.configService.get<string>('GOOGLE_CLIENT_SECRET') || ''
      );
      params.append('refresh_token', token.refreshToken);
      params.append('grant_type', 'refresh_token');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const res = await axios.post(
        'https://oauth2.googleapis.com/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const newAccessToken = res.data.access_token;
      const expiresIn = res.data.expires_in; // seconds

      token.accessToken = newAccessToken;
      token.expiryDate = new Date(Date.now() + expiresIn * 1000);

      return this.repo.save(token);
    } catch (error) {
      this.logger.error(
        `Error refreshing Google token for user ${token.user.id}: ${error}`
      );
      throw error;
    }
  }

  async getValidToken(user: UserEntity, provider: string): Promise<Token> {
    try {
      const token = await this.getToken(user, provider);

      if (!token) throw new Error('Token not found');

      // If Google token expired,then refresh it
      if (provider === 'google' && this.isExpired(token)) {
        return this.refreshGoogleToken(token);
      }

      return token;
    } catch (error) {
      this.logger.error(
        `Error getting valid token for user ${user.id} and provider ${provider}: ${error}`
      );
      throw error;
    }
  }
}
