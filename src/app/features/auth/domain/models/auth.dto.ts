import { UserRole } from './user-role.enum';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  tokenType: string;
  email: string;
  username: string;
  role: UserRole;
}
