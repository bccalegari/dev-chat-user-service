/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { GetProfileByUserIdUsecase } from '@modules/profile/application/usecases/get-profile-by-user-id.usecase';
import { Profile } from '@modules/profile/domain/entities/profile';
import { ProfileNotFoundException } from '@modules/profile/application/exceptions/profile-not-found.exception';

describe('GetProfileByUserIdUsecase Tests', () => {
  let module: TestingModule;
  let useCase: GetProfileByUserIdUsecase;
  let profileRepository: ProfileRepository;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GetProfileByUserIdUsecase,
        {
          provide: PROFILE_REPOSITORY,
          useValue: {
            findByUserId: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetProfileByUserIdUsecase>(GetProfileByUserIdUsecase);
    profileRepository = module.get<ProfileRepository>(PROFILE_REPOSITORY);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  it('should get profile by id when user exists', async () => {
    const userId = 'user-id';
    const mockProfile = {
      id: 'existing-id',
      userId: userId,
      username: 'johndoe',
      birthDate: new Date('1990-01-01'),
      birthDateString: '1995-09-09',
      bio: 'Hello, I am John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Profile;

    jest.mocked(profileRepository.findByUserId).mockResolvedValue(mockProfile);

    await expect(useCase.execute(userId)).resolves.toEqual({
      id: mockProfile.id,
      username: mockProfile.username,
      birthDate: mockProfile.birthDateString,
      bio: mockProfile.bio,
      userId: mockProfile.userId,
      createdAt: mockProfile.createdAt.toISOString(),
      updatedAt: mockProfile.updatedAt?.toISOString(),
      deletedAt: undefined,
    });

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(userId);
  });

  it('should throw ProfileNotFoundException when user not found', async () => {
    const userId = 'non-user-id';
    await expect(useCase.execute(userId)).rejects.toThrow(
      ProfileNotFoundException,
    );
    expect(profileRepository.findByUserId).toHaveBeenCalledWith(userId);
  });
});
