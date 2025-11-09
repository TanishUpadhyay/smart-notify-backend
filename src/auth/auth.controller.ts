/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectLogger } from 'src/common/Logger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'winston';
import { RegisterDTO } from './dto/registerDTO';
import { UserResponseDTO } from '../users/dto';
import { GoogleGuard, JwtAuthGuard, LocalGuard } from './guards';
import { plainToInstance } from 'class-transformer';
import { CONFIG_DICTIONARY } from 'src/config/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectLogger() private readonly logger: Logger
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDTO: RegisterDTO) {
    this.logger.debug(`Registering user with email ${registerDTO.email}.`);
    const user = await this.authService.register(registerDTO);
    return { message: 'User registered successfully', userId: user.id };
  }

  @Post('login')
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() request: any
  ): Promise<{ token: string; user: UserResponseDTO }> {
    const result = await this.authService.login(request.user);
    const user = plainToInstance(UserResponseDTO, request.user, {
      excludeExtraneousValues: true
    });
    return { token: result.access_token, user };
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() request: any) {
    this.logger.debug(`Fetching profile for user ID ${request.user.id}.`);
    const { id, email, username, profilePicture, provider } = request.user;
    return { id, email, username, profilePicture, provider };
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth() {
    // Guard redirects
  }
  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@Request() request: any, @Response() res: any) {
    this.logger.debug(
      `Google authentication successful for user ID ${request.user.id}.`
    );
    try {
      const result = await this.authService.login(request.user);
      const user = plainToInstance(UserResponseDTO, request.user, {
        excludeExtraneousValues: true
      });
      const clientUrl = this.configService.get<string>(
        CONFIG_DICTIONARY.FRONTEND_URL
      );
      const redirectUrl = new URL('/auth/callback', clientUrl);
      redirectUrl.searchParams.set('token', result.access_token);
      redirectUrl.searchParams.set('user', JSON.stringify(user));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      this.logger.error(
        `Error during Google authentication callback: ${error.message}`
      );
      const frontendUrl = this.configService.get<string>(
        CONFIG_DICTIONARY.FRONTEND_URL
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return res.redirect(
        `${frontendUrl}/auth/error?message=Failed to authenticate with Google`
      );
    }
  }
}
