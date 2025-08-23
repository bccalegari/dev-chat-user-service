import { Module } from '@nestjs/common';
import { KafkaModule } from '@shared/kafka/kafka.module';
import { Neo4jModule } from '@shared/neo4j/neo4j.module';
import { UserChangeKafkaConsumer } from '@modules/user/adapters/inbound/consumers/user-change-kafka.consumer';
import { UserEventPublisher } from '@modules/user/application/publishers/user-event.publisher';
import { UserCreatedListener } from '@modules/user/application/listeners/user-created.listener';
import { USER_REPOSITORY } from '@modules/user/domain/repositories/user.repository.interface';
import { UserNeo4jRepository } from '@modules/user/adapters/outbound/repositories/user-neo4j.repository';
import {
  USER_EVENT_STRATEGY,
  UserEventPublisherStrategy,
} from '@modules/user/application/publishers/user-event-publisher.strategy';
import { UserUpdatedListener } from '@modules/user/application/listeners/user-updated.listener';
import { UserDeletedListener } from '@modules/user/application/listeners/user-deleted.listener';
import { UserCreatedEventPublisher } from '@modules/user/application/publishers/user-created-event.publisher';
import { UserUpdatedEventPublisher } from '@modules/user/application/publishers/user-updated-event.publisher';
import { UserDeletedEventPublisher } from '@modules/user/application/publishers/user-deleted-event.publisher';
import { UserResolver } from '@modules/user/adapters/inbound/resolvers/user.resolver';
import { GetUserByIdUseCase } from '@modules/user/application/usecases/get-user-by-id.usecase';

@Module({
  imports: [KafkaModule, Neo4jModule],
  controllers: [UserChangeKafkaConsumer],
  providers: [
    UserEventPublisher,
    UserCreatedEventPublisher,
    UserUpdatedEventPublisher,
    UserDeletedEventPublisher,
    {
      provide: USER_EVENT_STRATEGY,
      useFactory: (
        created: UserCreatedEventPublisher,
        updated: UserUpdatedEventPublisher,
        deleted: UserDeletedEventPublisher,
      ): UserEventPublisherStrategy[] => [created, updated, deleted],
      inject: [
        UserCreatedEventPublisher,
        UserUpdatedEventPublisher,
        UserDeletedEventPublisher,
      ],
    },
    UserCreatedListener,
    UserUpdatedListener,
    UserDeletedListener,
    {
      provide: USER_REPOSITORY,
      useClass: UserNeo4jRepository,
    },
    UserResolver,
    GetUserByIdUseCase,
  ],
})
export class UserModule {}
