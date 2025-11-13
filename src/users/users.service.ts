/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { IUserService } from './interface/userServiceInterface';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { InjectLogger } from 'src/common/Logger';
import { AuthProvider } from './entity/user.entity';
// This should be a real class/interface representing a user entity

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectLogger() private readonly logger: Logger
  ) {}
  async createUser(userData: CreateUserDTO): Promise<UserEntity> {
    try {
      const {
        email: userEmail,
        firstName,
        lastName,
        password: userPassword,
        emailVerified,
        googleId,
        authProvider,
        profilePicture
      } = userData;
      const email = userEmail.toLowerCase();

      //check if user already exists
      const existingUser = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .getOne();
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
      const username = firstName + lastName;
      const user = await this.userRepository.save(
        this.userRepository.create({
          email,
          username,
          profilePicture,
          emailVerified: emailVerified || false,
          googleId: googleId ?? undefined,
          provider: authProvider || AuthProvider.LOCAL,
          ...(userPassword && authProvider === AuthProvider.LOCAL
            ? { password: userPassword }
            : {}),
          ...(googleId && authProvider === AuthProvider.GOOGLE
            ? { isGoogleAuth: true }
            : {})
        })
      );
      return user;
    } catch (error) {
      this.logger.error(`Error creating user ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async getUserById(userId: number): Promise<UserEntity> {
    try {
      return await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: userId })
        .getOneOrFail();
    } catch (error) {
      this.logger.error(
        `Error fetching user by ID ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error fetching user by ID');
    }
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    try {
      return await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .getOneOrFail();
    } catch (error) {
      this.logger.error(
        `Error fetching user by ID ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error fetching user by ID');
    }
  }

  async updateUser(
    userId: number,
    updateUserDTO: UpdateUserDTO
  ): Promise<UserEntity> {
    try {
      const OldUser = await this.getUserById(userId);
      if (!OldUser) {
        throw new InternalServerErrorException('User not found');
      }
      const updatedUser: Partial<UserEntity> = {};
      if (updateUserDTO.profileImage) {
        updatedUser.profilePicture = updateUserDTO.profileImage;
      }
      if (updateUserDTO.username) {
        updatedUser.username = updateUserDTO.username;
      }

      const updatedResult = await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set(updatedUser)
        .where('id = :id', { id: userId })
        .returning('*')
        .execute();
      if (!updatedResult.raw[0]) {
        throw new InternalServerErrorException(
          'User update failed. User not found'
        );
      }
      const user = await this.getUserById(userId);
      return user;
    } catch (error) {
      this.logger.error(`Error updating user ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({ lastLogin: new Date() })
        .where('id = :id', { id: userId })
        .execute();
    } catch (error) {
      this.logger.error(
        `Error updating last login for user: ${userId}.${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error updating last login');
    }
  }

  async getUserWithGoogleId(googleId: string): Promise<UserEntity | null> {
    try {
      return await this.userRepository
        .createQueryBuilder('user')
        .where('user.googleId = :googleId', { googleId })
        .getOne();
    } catch (error) {
      this.logger.error(
        `Error fetching user by Google ID ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException(
        'Error fetching user by Google ID'
      );
    }
  }

  async updateUserGoogleInfo(
    userId: number,
    googleId: string,
    provider: AuthProvider
  ): Promise<UserEntity> {
    try {
      const updatedResult = await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({ googleId, isGoogleAuth: true, provider })
        .where('id = :id', { id: userId })
        .execute();
      if (!updatedResult.raw[0]) {
        throw new InternalServerErrorException(
          'User update failed. User not found'
        );
      }
      const user = await this.getUserById(userId);
      return user;
    } catch (error) {
      this.logger.error(
        `Error updating Google info for user ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Error updating Google info');
    }
  }
  // deleteUser(userId: string): Promise<void> {
  //   throw new Error('Method not implemented.');
  // }
}
