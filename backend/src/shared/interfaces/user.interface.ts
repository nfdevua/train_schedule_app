export type UserRole = 'user' | 'admin';

export interface IUser {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}
