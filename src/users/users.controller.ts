import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('users')
export class UsersController {
  // Controller methods will go here
  constructor(private readonly userService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    const user = await this.userService.createUser(createUserDTO);
    return plainToInstance(CreateUserDTO, user);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserByID(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    return plainToInstance(CreateUserDTO, user, {
      excludeExtraneousValues: true
    });
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO
  ) {
    const updatedUser = await this.userService.updateUser(id, updateUserDTO);
    return plainToInstance(CreateUserDTO, updatedUser, {
      excludeExtraneousValues: true
    });
  }
}
