import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetProfileDto } from '@modules/profile/adapters/outbound/dto/get-profile.dto';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { ProfileMapper } from '@modules/profile/application/mappers/profile.mapper';
import { ProfileNotFoundException } from '@modules/profile/application/exceptions/profile-not-found.exception';

@Injectable()
export class GetProfileByUserIdUsecase {
  private logger = new Logger(GetProfileByUserIdUsecase.name);

  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(userId: string): Promise<GetProfileDto | null> {
    try {
      this.logger.log(`Getting profile by userId, userId=${userId}`);
      return await this.getProfileByUserId(userId);
    } catch (error) {
      this.logger.error(
        `Failed to get profile by userId, userId=${userId}`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  private async getProfileByUserId(id: string): Promise<GetProfileDto | null> {
    const profile = await this.profileRepository.findByUserId(id);

    if (!profile) {
      throw new ProfileNotFoundException();
    }

    return ProfileMapper.toGetProfileDto(profile);
  }
}
