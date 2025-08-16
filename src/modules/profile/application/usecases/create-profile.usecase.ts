import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateProfileDto } from '@modules/profile/adapters/inbound/dto/create-profile.dto';
import { ProfileMapper } from '@modules/profile/application/mappers/profile.mapper';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { GetProfileDto } from '@modules/profile/adapters/outbound/dto/get-profile.dto';
import { UserNotFoundException } from '@modules/user/application/exceptions/user-not-found.exception';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { ProfileAlreadyExistsException } from '@modules/profile/application/exceptions/profile-already-exists.exception';

@Injectable()
export class CreateProfileUsecase {
  private logger = new Logger(CreateProfileUsecase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(dto: CreateProfileDto): Promise<GetProfileDto> {
    try {
      this.logger.log(`Creating profile, userId=${dto.userId}`);
      await this.existsUserById(dto.userId);
      await this.existsProfileByUserId(dto.userId);
      const profile = ProfileMapper.fromCreateProfileDto(dto);
      await this.profileRepository.create(profile);
      return ProfileMapper.toGetProfileDto(profile);
    } catch (error) {
      this.logger.error(
        `Failed to create profile, userId=${dto.userId}`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  private async existsUserById(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
  }

  private async existsProfileByUserId(id: string): Promise<void> {
    const profile = await this.profileRepository.findByUserId(id);
    if (profile) {
      throw new ProfileAlreadyExistsException();
    }
  }
}
