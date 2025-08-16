import { Profile } from '@modules/profile/domain/entities/profile';

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  create(profile: Profile): Promise<void>;
  update(profile: Profile): Promise<void>;
  delete(profile: Profile): Promise<void>;
}

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');
