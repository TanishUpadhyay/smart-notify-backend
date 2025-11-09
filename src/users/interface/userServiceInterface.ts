import { UserEntity } from '../entity/user.entity';
import { CreateUserDTO, UpdateUserDTO } from '../dto';

export interface IUserService {
  createUser(userData: CreateUserDTO): Promise<UserEntity>;
  getUserById(userId: string): Promise<UserEntity>;
  getUserByEmail(email: string): Promise<UserEntity | null>;
  updateUser(userId: string, updateUserDTO: UpdateUserDTO): Promise<UserEntity>;
  // deleteUser(userId: string): Promise<void>;
}
