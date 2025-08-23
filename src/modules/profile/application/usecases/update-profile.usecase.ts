import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetProfileDto } from '@modules/profile/adapters/outbound/dto/get-profile.dto';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { ProfileNotFoundException } from '@modules/profile/application/exceptions/profile-not-found.exception';
import { Profile } from '@modules/profile/domain/entities/profile';
import { ProfileMapper } from '@modules/profile/application/mappers/profile.mapper';
import { UpdateProfileDto } from '@modules/profile/adapters/inbound/dto/update-profile.dto';
import { ProfileAlreadyExistsException } from '@modules/profile/application/exceptions/profile-already-exists.exception';

@Injectable()
export class UpdateProfileUsecase {
  private logger = new Logger(UpdateProfileUsecase.name);

  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(dto: UpdateProfileDto): Promise<GetProfileDto> {
    try {
      this.logger.log(`Deleting profile by id, profileId=${dto.id}`);
      const profile = await this.getProfileById(dto.id);

      if (dto.username && dto.username !== profile.username) {
        await this.existsProfileByUsername(dto.username);
      }

      profile.update({
        username: dto.username ?? profile.username,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : profile.birthDate,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      });
      await this.profileRepository.update(profile);
      return ProfileMapper.toGetProfileDto(profile);
    } catch (error) {
      this.logger.error(
        `Failed to delete profile by id, profileId=${dto.id}`,
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

  private async existsProfileByUsername(username: string): Promise<void> {
    const exists = await this.profileRepository.existsByUsername(username);
    if (exists) {
      throw new ProfileAlreadyExistsException();
    }
  }
}
