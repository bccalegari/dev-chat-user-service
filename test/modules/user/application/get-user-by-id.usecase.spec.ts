/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdUseCase } from '@modules/user/application/usecases/get-user-by-id.usecase';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { UserNotFoundException } from '@modules/user/application/exceptions/user-not-found.exception';
import { User } from '@modules/user/domain/entities/user';

describe('GetUserByIdUseCase Unit Tests', () => {
  let module: TestingModule;
  let useCase: GetUserByIdUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findById: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  it('should get user by id when user exists', async () => {
    const userId = 'existing-id';
    const mockUser = {
      id: userId,
      keycloakId: 'keycloak-id',
      name: 'John',
      lastName: 'Doe',
      email: 'johndoe@email.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    jest.mocked(userRepository.findById).mockResolvedValue(mockUser);

    await expect(useCase.execute(userId)).resolves.toEqual({
      id: mockUser.id,
      name: mockUser.fullName,
      email: mockUser.email,
      createdAt: mockUser.createdAt.toISOString(),
      updatedAt: mockUser.updatedAt?.toISOString(),
    });

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw UserNotFoundException when user not found', async () => {
    const userId = 'non-existing-id';
    await expect(useCase.execute(userId)).rejects.toThrow(
      UserNotFoundException,
    );
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
  });
});
