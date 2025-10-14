import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { CreateProfileDto } from '@modules/profile/adapters/inbound/dto/create-profile.dto';
import { CreateProfileUsecase } from '@modules/profile/application/usecases/create-profile.usecase';
import { GetProfileDto } from '@modules/profile/adapters/outbound/dto/get-profile.dto';
import { GraphQLResolveInfo } from 'graphql/type';
import { GetProfileByUserIdUsecase } from '@modules/profile/application/usecases/get-profile-by-user-id.usecase';
import { UpdateProfileDto } from '@modules/profile/adapters/inbound/dto/update-profile.dto';
import { UpdateProfileUsecase } from '@modules/profile/application/usecases/update-profile.usecase';

@Resolver()
export class ProfileResolver {
  private readonly logger = new Logger(ProfileResolver.name);

  constructor(
    private readonly createProfileUseCase: CreateProfileUsecase,
    private readonly getProfileByUserIdUseCase: GetProfileByUserIdUsecase,
    private readonly updateProfileUseCase: UpdateProfileUsecase,
  ) {}

  @Mutation(() => GetProfileDto, { description: 'Create a new profile' })
  async createProfile(
    @Args('createProfileDto') dto: CreateProfileDto,
    @Info() info: GraphQLResolveInfo,
  ): Promise<CreateProfileDto> {
    const requestedFields = info.fieldNodes[0].selectionSet?.selections.map(
      (s: any) => s.name.value,
    );
    this.logger.log(
      `Creating profile, input=${JSON.stringify(dto)}, requestedFields=${JSON.stringify(requestedFields)}`,
    );
    const profile = await this.createProfileUseCase.execute(dto);
    this.logger.log(
      `Profile created successfully, response=${JSON.stringify(profile)}`,
    );
    return profile;
  }

  @Query(() => GetProfileDto, {
    description: 'Get profile by user id',
    nullable: true,
  })
  async getProfile(
    @Args('userId') userId: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<GetProfileDto | null> {
    const requestedFields = info.fieldNodes[0].selectionSet?.selections.map(
      (s: any) => s.name.value,
    );
    this.logger.log(
      `Fetching profile by userId, userId=${userId}, requestedFields=${JSON.stringify(requestedFields)}`,
    );
    const profile = await this.getProfileByUserIdUseCase.execute(userId);
    this.logger.log(
      `Profile fetched successfully, response=${JSON.stringify(profile)}`,
    );
    return profile;
  }

  @Mutation(() => GetProfileDto, { description: 'Update profile by id' })
  async updateProfile(
    @Args('updateProfileDto') dto: UpdateProfileDto,
    @Info() info: GraphQLResolveInfo,
  ): Promise<GetProfileDto> {
    const requestedFields = info.fieldNodes[0].selectionSet?.selections.map(
      (s: any) => s.name.value,
    );
    this.logger.log(
      `Updating profile by id, input=${JSON.stringify(dto)}, requestedFields=${JSON.stringify(requestedFields)}`,
    );
    const profile = await this.updateProfileUseCase.execute(dto);
    this.logger.log(
      `Profile updated successfully, response=${JSON.stringify(profile)}`,
    );
    return profile;
  }
}
