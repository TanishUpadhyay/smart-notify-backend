import { User } from 'src/users/users.service';
import { RegisterDTO } from '../dto/registerDTO';

export interface GoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  googleId: string;
}

export interface IAuthenticationService {
  /**
   * Validates user credentials.
   * @param email - User's email address.
   * @param password - User's password.
   * @returns The user object without the password hash.
   * @throws UnauthorizedException if the credentials are invalid.
   */
  validateUser(email: string, password: string): Promise<User>;

  /**
   * Logs in the user and generates a JWT token.
   * @param user - The validated user object.
   * @returns An object containing the access token.
   */
  login(user: User): Promise<{ access_token: string }>;

  /**
   * Registers a new user.
   * @param registerDto - The registration data transfer object.
   * @returns The created user entity.
   */
  register(registerDto: RegisterDTO): Promise<User>;

  /**
   * Validates or creates a user from Google profile data.
   * @param googleData - User data from Google
   * @returns The user object
   */
  validateGoogleUser(googleData: GoogleUserData): Promise<User>;

  /**
   * Sends a password reset email to the user.
   * @param email - User's email address.
   * @returns A confirmation message.
   */
  forgotPassword(email: string): Promise<void>;

  /**
   * Resets the user's password.
   * @param token - The password reset token.
   * @param newPassword - The new password.
   */
  resetPassword(token: string, newPassword: string): Promise<void>;
}
