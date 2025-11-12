import { Expose, Transform } from 'class-transformer';

export class UserResponseDTO {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() username?: string;
  @Expose() profileImage?: string;
  @Expose() roles: string[];
  @Expose() isActive: boolean;

  constructor(partial: Partial<UserResponseDTO> = {}) {
    this.id = partial.id ?? '';
    this.email = partial.email ?? '';
    this.username = partial.username;
    this.profileImage = partial.profileImage;
    this.roles = partial.roles ?? [];
    this.isActive = partial.isActive ?? true;
  }
}
