import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetProfileDto } from '@modules/profile/adapters/outbound/dto/get-profile.dto';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { ProfileNotFoundException } from '@modules/profile/application/exceptions/profile-not-found.exception';
import { Profile } from '@modules/profile/domain/entities/profile';
import { ProfileMapper } from '@modules/profile/application/mappers/profile.mapper';

@Injectable()
export class DeleteProfileUsecase {
  private logger = new Logger(DeleteProfileUsecase.name);

  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(profileId: string): Promise<GetProfileDto> {
    try {
      this.logger.log(`Deleting profile by id, profileId=${profileId}`);
      const profile = await this.getProfileById(profileId);
      profile.delete();
      await this.profileRepository.delete(profile);
      return ProfileMapper.toGetProfileDto(profile);
    } catch (error) {
      this.logger.error(
        `Failed to delete profile by id, profileId=${profileId}`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  private async getProfileById(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new ProfileNotFoundException();
    }
    return profile;
  }
}
