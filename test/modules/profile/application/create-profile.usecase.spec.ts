/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { CreateProfileUsecase } from '@modules/profile/application/usecases/create-profile.usecase';
import { Profile } from '@modules/profile/domain/entities/profile';
import { ProfileAlreadyExistsException } from '@modules/profile/application/exceptions/profile-already-exists.exception';
import { UserNotFoundException } from '@modules/user/application/exceptions/user-not-found.exception';
import { CreateProfileDto } from '@modules/profile/adapters/inbound/dto/create-profile.dto';
import { User } from '@modules/user/domain/entities/user';

describe('CreateProfileUsecase Unit Tests', () => {
  let module: TestingModule;
  let useCase: CreateProfileUsecase;
  let profileRepository: ProfileRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CreateProfileUsecase,
        {
          provide: PROFILE_REPOSITORY,
          useValue: {
            findByUserId: jest.fn().mockResolvedValue(null),
            create: jest.fn(),
          },
        },
        {
          provide: USER_REPOSITORY,
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: 'user-id' }),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateProfileUsecase>(CreateProfileUsecase);
    profileRepository = module.get<ProfileRepository>(PROFILE_REPOSITORY);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  it('should create profile when user exists and profile does not exist', async () => {
    const dto: CreateProfileDto = {
      userId: 'user-id',
      username: 'johndoe',
      birthDate: '1990-01-01',
      bio: 'Hello, I am John Doe',
      avatarUrl: 'http://example.com/avatar.jpg',
    };

    const mockProfile = {
      userId: dto.userId,
      username: dto.username,
      birthDate: new Date('1990-01-01'),
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
      birthDateString: '1990-01-01',
    } as Profile;

    jest.mocked(profileRepository.findByUserId).mockResolvedValue(null);
    jest
      .mocked(userRepository.findById)
      .mockResolvedValue({ id: 'user-id' } as User);
    jest.mocked(profileRepository.create).mockResolvedValue(Promise.resolve());

    await expect(useCase.execute(dto)).resolves.toEqual({
      id: expect.any(String),
      username: dto.username,
      birthDate: mockProfile.birthDateString,
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
      userId: dto.userId,
      createdAt: expect.any(String),
      updatedAt: undefined,
      deletedAt: undefined,
    });

    expect(profileRepository.create).toHaveBeenCalled();
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    jest.mocked(userRepository.findById).mockResolvedValue(null);

    const dto: CreateProfileDto = {
      userId: 'non-user-id',
      username: 'johndoe',
      birthDate: '1990-01-01',
      bio: 'Hello, I am John Doe',
      avatarUrl: 'http://example.com/avatar.jpg',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(UserNotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith(dto.userId);
  });

  it('should throw ProfileAlreadyExistsException when profile already exists', async () => {
    const existingProfile = {
      id: 'profile-id',
      userId: 'user-id',
      username: 'johndoe',
      birthDate: new Date('1990-01-01'),
      bio: 'Hello, I am John Doe',
      avatarUrl: 'http://example.com/avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Profile;

    jest
      .mocked(profileRepository.findByUserId)
      .mockResolvedValue(existingProfile);

    const dto: CreateProfileDto = {
      userId: 'user-id',
      username: 'johndoe',
      birthDate: '1990-01-01',
      bio: 'Hello, I am John Doe',
      avatarUrl: 'http://example.com/avatar.jpg',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      ProfileAlreadyExistsException,
    );
    expect(profileRepository.findByUserId).toHaveBeenCalledWith(dto.userId);
  });
});
