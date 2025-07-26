import { Module } from '@nestjs/common';
import { KafkaModule } from '@shared/kafka/kafka.module';
import { Neo4jModule } from '@shared/neo4j/neo4j.module';
import { UserCreatedKafkaConsumer } from '@modules/user/adapters/inbound/user-created-kafka.consumer';
import { UserEventPublisher } from '@modules/user/application/publishers/user-event.publisher';
import { UserCreatedListener } from '@modules/user/application/listeners/user-created.listener';
import { USER_REPOSITORY } from '@modules/user/user.tokens';
import { UserNeo4jRepository } from '@modules/user/adapters/outbound/user-neo4j.repository';
import {
  USER_EVENT_STRATEGY,
  UserEventStrategy,
} from '@modules/user/application/publishers/user-event.strategy';
import { UserCreatedEventStrategy } from '@modules/user/application/publishers/user-created-event.publisher';

@Module({
  imports: [KafkaModule, Neo4jModule],
  controllers: [UserCreatedKafkaConsumer],
  providers: [
    UserEventPublisher,
    UserCreatedEventStrategy,
    {
      provide: USER_EVENT_STRATEGY,
      useFactory: (created: UserCreatedEventStrategy): UserEventStrategy[] => [
        created,
      ],
      inject: [UserCreatedEventStrategy],
    },
    UserCreatedListener,
    {
      provide: USER_REPOSITORY,
      useClass: UserNeo4jRepository,
    },
  ],
})
export class UserModule {}
