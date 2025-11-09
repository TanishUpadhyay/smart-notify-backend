/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserEntity } from 'src/users/entity/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // change default 'username' to 'email'
  }

  async validate(email: string, password: string): Promise<UserEntity> {
    try {
      const userEmail = email.toLowerCase();
      const user = await this.authService.validateUser(userEmail, password);
      if (!user) throw new UnauthorizedException('Invalid credentials');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';
      throw new UnauthorizedException(errorMessage);
    }
  }
}
