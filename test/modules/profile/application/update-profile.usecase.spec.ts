/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { UpdateProfileUsecase } from '@modules/profile/application/usecases/update-profile.usecase';
import { Profile } from '@modules/profile/domain/entities/profile';
import { ProfileNotFoundException } from '@modules/profile/application/exceptions/profile-not-found.exception';
import { ProfileAlreadyExistsException } from '@modules/profile/application/exceptions/profile-already-exists.exception';
import { UpdateProfileDto } from '@modules/profile/adapters/inbound/dto/update-profile.dto';

describe('UpdateProfileUsecase Unit Tests', () => {
  let module: TestingModule;
  let useCase: UpdateProfileUsecase;
  let profileRepository: ProfileRepository;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UpdateProfileUsecase,
        {
          provide: PROFILE_REPOSITORY,
          useValue: {
            findById: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
            existsByUsername: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUsecase>(UpdateProfileUsecase);
    profileRepository = module.get<ProfileRepository>(PROFILE_REPOSITORY);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  it('should update profile when profile exists and username is unique', async () => {
    const dto: UpdateProfileDto = {
      id: 'profile-id',
      username: 'newusername',
      birthDate: '1991-01-01',
      bio: 'Updated bio',
      avatarUrl: 'http://example.com/avatar.png',
    };

    const mockProfile = {
      id: 'profile-id',
      userId: 'user-id',
      username: 'oldusername',
      avatarUrl: 'http://example.com/old-avatar.jpg',
      bio: 'Old bio',
      birthDate: new Date('1990-01-01'),
      birthDateString: '1995-09-09',
      createdAt: new Date(),
    } as Profile;

    mockProfile.update = (mockProfile) => {
      mockProfile.username = dto.username!;
      mockProfile.birthDate = new Date(dto.birthDate!);
      mockProfile.bio = dto.bio!;
      mockProfile.avatarUrl = dto.avatarUrl!;
      Object.assign(mockProfile, { updatedAt: new Date() });
      Object.assign(mockProfile, { birthDateString: dto.birthDate! });
    };

    jest.mocked(profileRepository.findById).mockResolvedValue(mockProfile);
    jest.mocked(profileRepository.existsByUsername).mockResolvedValue(false);
    jest.mocked(profileRepository.update).mockResolvedValue(Promise.resolve());

    await expect(useCase.execute(dto)).resolves.toEqual({
      id: mockProfile.id,
      username: mockProfile.username,
      birthDate: mockProfile.birthDateString,
      bio: mockProfile.bio,
      avatarUrl: mockProfile.avatarUrl,
      userId: mockProfile.userId,
      createdAt: mockProfile.createdAt.toISOString(),
      updatedAt: mockProfile.updatedAt?.toISOString(),
      deletedAt: mockProfile.deletedAt?.toISOString(),
    });
    expect(profileRepository.update).toHaveBeenCalledWith(mockProfile);
  });

  it('should throw ProfileNotFoundException when profile does not exist', async () => {
    const dto: UpdateProfileDto = {
      id: 'non-existing-id',
      username: 'newusername',
      birthDate: '1991-01-01',
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      ProfileNotFoundException,
    );
  });

  it('should throw ProfileAlreadyExistsException when username already exists', async () => {
    const dto: UpdateProfileDto = {
      id: 'profile-id',
      username: 'existingusername',
      birthDate: '1991-01-01',
    };

    const mockProfile = {
      id: 'profile-id',
      userId: 'user-id',
      username: 'oldusername',
      birthDate: new Date('1990-01-01'),
    } as Profile;

    jest.mocked(profileRepository.findById).mockResolvedValue(mockProfile);
    jest.mocked(profileRepository.existsByUsername).mockResolvedValue(true);
    await expect(useCase.execute(dto)).rejects.toThrow(
      ProfileAlreadyExistsException,
    );
  });
});
