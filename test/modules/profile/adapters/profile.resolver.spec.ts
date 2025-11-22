import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Profile } from '@modules/profile/domain/entities/profile';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { LoggerFactory } from '@shared/logging/logger.factory';
import { ProfileResolver } from '@modules/profile/adapters/inbound/resolvers/profile.resolver';
import { ProfileNeo4jRepository } from '@modules/profile/adapters/outbound/repositories/profile-neo4j.repository';
import { GetProfileByUserIdUsecase } from '@modules/profile/application/usecases/get-profile-by-user-id.usecase';
import { CreateProfileUsecase } from '@modules/profile/application/usecases/create-profile.usecase';
import { UpdateProfileUsecase } from '@modules/profile/application/usecases/update-profile.usecase';
import * as request from 'supertest';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { UserNeo4jRepository } from '@modules/user/adapters/outbound/repositories/user-neo4j.repository';
import { User } from '@modules/user/domain/entities/user';

describe('ProfileResolver Tests', () => {
  let app: INestApplication<App>;

  const mockProfile = Profile.from({
    id: 'profile-123',
    userId: 'user-123',
    username: 'johndoe',
    bio: 'This is a sample bio',
    birthDate: new Date('1995-09-09'),
    createdAt: new Date(),
  });

  const profileRepository = {
    findById: jest.fn().mockResolvedValue(mockProfile),
    findByUserId: jest.fn().mockResolvedValue(mockProfile),
    existsByUsername: jest.fn().mockResolvedValue(false),
    create: jest.fn().mockResolvedValue(mockProfile),
    update: jest.fn(),
    delete: jest.fn(),
  } as ProfileRepository;

  const userRepository = {
    findById: jest.fn().mockResolvedValue(
      User.from({
        id: '123',
        name: 'bruno',
        lastName: 'silva',
        email: 'bruno@email.com',
        createdAt: new Date(),
      }),
    ),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as UserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: join(process.cwd(), 'graphql/schema.gql'),
        }),
      ],
      providers: [
        ProfileResolver,
        GetProfileByUserIdUsecase,
        CreateProfileUsecase,
        UpdateProfileUsecase,
        {
          provide: PROFILE_REPOSITORY,
          useClass: ProfileNeo4jRepository,
        },
        {
          provide: USER_REPOSITORY,
          useClass: UserNeo4jRepository,
        },
      ],
    })
      .overrideProvider(PROFILE_REPOSITORY)
      .useValue(profileRepository)
      .overrideProvider(USER_REPOSITORY)
      .useValue(userRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useLogger(LoggerFactory('ProfileResolverTest'));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get profile by user id', async () => {
    const query = `
      query {
        getProfile(userId: "user-123") {
          id
          username
          birthDate
          bio
          userId
          createdAt
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.getProfile).toEqual({
          id: 'profile-123',
          username: 'johndoe',
          birthDate: '1995-09-09',
          bio: 'This is a sample bio',
          userId: 'user-123',
          createdAt: expect.any(String),
        });
      });
  });

  it('should create a new profile', async () => {
    profileRepository.findByUserId = jest.fn().mockResolvedValue(null);

    const mutation = `
      mutation {
        createProfile(createProfileDto: {
          userId: "user-123",
          username: "johndoe",
          bio: "This is a sample bio",
          birthDate: "1995-09-09",
        }) {
          id
          username
          birthDate
          bio
          userId
          createdAt
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.createProfile).toEqual({
          id: expect.any(String),
          username: 'johndoe',
          birthDate: '1995-09-09',
          bio: 'This is a sample bio',
          userId: 'user-123',
          createdAt: expect.any(String),
        });
      });
  });

  it('should update profile by id', async () => {
    const mutation = `
      mutation {
        updateProfile(updateProfileDto: {
          id: "profile-123",
          username: "john_doe_updated",
          bio: "This is an updated bio",
          birthDate: "1995-10-10",
        }) {
          id
          username
          birthDate
          bio
          userId
          createdAt
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: mutation })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.updateProfile).toEqual({
          id: 'profile-123',
          username: 'john_doe_updated',
          birthDate: '1995-10-10',
          bio: 'This is an updated bio',
          userId: 'user-123',
          createdAt: expect.any(String),
        });
      });
  });
});
