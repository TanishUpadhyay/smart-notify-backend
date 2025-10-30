/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  GoogleUserData,
  IAuthenticationService
} from './interface/auth-interface';
import { RegisterDTO } from './dto/registerDTO';

@Injectable()
export class AuthService implements IAuthenticationService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}
  validateUser(email: string, password: string): Promise<User> {
    throw new Error('Method not implemented.');
  }
  login(user: User): Promise<{ access_token: string }> {
    throw new Error('Method not implemented.');
  }
  register(registerDto: RegisterDTO): Promise<User> {
    throw new Error('Method not implemented.');
  }
  validateGoogleUser(googleData: GoogleUserData): Promise<User> {
    throw new Error('Method not implemented.');
  }
  forgotPassword(email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  resetPassword(token: string, newPassword: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async signIn(
    username: string,
    pass: string
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }
}
