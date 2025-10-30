import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  // Sample users array to mimic a database. Later this should be replaced by typeorm.
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme'
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess'
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  findOne(username: string): Promise<User | undefined> {
    return Promise.resolve(
      this.users.find((user) => user.username === username)
    );
  }
}
