import { User } from '@modules/user/domain/entities/user';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByKeycloakId(keycloakId: string): Promise<User | null>;
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(user: User): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
