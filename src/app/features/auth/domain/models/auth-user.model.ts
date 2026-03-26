import { UserRole } from './user-role.enum';

export interface AuthUser {
  readonly email: string;
  readonly username: string;
  readonly role: UserRole;
}
