/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  // For the initial redirect and the callback route this guard can be reused.
  // Override canActivate if you need to add extra checks before Passport runs.

  async canActivate(context: ExecutionContext) {
    // run passport authentication
    const CanActivate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return CanActivate;
  }
}
