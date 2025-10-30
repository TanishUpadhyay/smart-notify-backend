export class UserResponseDTO {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profileImage?: string;
  roles: string[];
  isActive: boolean;

  constructor(partial: Partial<UserResponseDTO> = {}) {
    this.id = partial.id ?? '';
    this.email = partial.email ?? '';
    this.firstName = partial.firstName;
    this.lastName = partial.lastName;
    this.fullName =
      partial.fullName ??
      (this.firstName || this.lastName
        ? [this.firstName, this.lastName].filter(Boolean).join(' ')
        : undefined);
    this.profileImage = partial.profileImage;
    this.roles = partial.roles ?? [];
    this.isActive = partial.isActive ?? true;
  }
}
