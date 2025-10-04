import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { UserResolver } from '@modules/user/adapters/inbound/resolvers/user.resolver';
import { GetUserByIdUseCase } from '@modules/user/application/usecases/get-user-by-id.usecase';
import { UserNeo4jRepository } from '@modules/user/adapters/outbound/repositories/user-neo4j.repository';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { User } from '@modules/user/domain/entities/user';
import { LoggerFactory } from '@shared/logging/logger.factory';

describe('UserResolver E2E Tests', () => {
  let app: INestApplication<App>;
  const userRepository = {
    findById: jest.fn().mockResolvedValue(
      User.from({
        id: '123',
        keycloakId: 'keycloak-123',
        name: 'bruno',
        lastName: 'silva',
        email: 'bruno@email.com',
        createdAt: new Date(),
      }),
    ),
    findByKeycloakId: jest.fn(),
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
        UserResolver,
        GetUserByIdUseCase,
        {
          provide: USER_REPOSITORY,
          useClass: UserNeo4jRepository,
        },
      ],
    })
      .overrideProvider(USER_REPOSITORY)
      .useValue(userRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useLogger(LoggerFactory('UserResolverE2E'));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get user by id', async () => {
    const query = `
      query {
        getUser(id: "123") {
          id
          name
          email
          createdAt
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.getUser).toEqual({
          id: '123',
          name: 'bruno silva',
          email: 'bruno@email.com',
          createdAt: expect.any(String),
        });
      });
  });
});
