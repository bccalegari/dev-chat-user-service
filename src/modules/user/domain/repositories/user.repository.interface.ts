import { User } from '@modules/user/domain/entities/user';

export interface UserRepository {
  createUser(user: User): Promise<void>;
}
