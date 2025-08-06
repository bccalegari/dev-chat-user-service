import { Controller, Logger } from '@nestjs/common';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { UserEventPublisher } from '@modules/user/application/publishers/user-event.publisher';
import { DeadLetterKafkaProducer } from '@shared/kafka/dead-letter-kafka.producer';
import { Ctx, EventPattern, KafkaContext } from '@nestjs/microservices';
import { AbstractKafkaConsumer } from '@shared/kafka/kafka.consumer.abstract';
import {
  UserChangeEvent,
  UserChangeEventEnvelope,
} from '@modules/user/adapters/inbound/consumers/user-change.event';
import { PROPERTIES } from '@app/app.properties';

@Controller()
export class UserChangeKafkaConsumer extends AbstractKafkaConsumer<
  UserChangeEventEnvelope,
  UserChangeEvent
> {
  private readonly logger = new Logger(UserChangeKafkaConsumer.name);
  override DLQ_TOPIC: string = PROPERTIES.KAFKA.KEYCLOAK.USER_DLQ_TOPIC;

  constructor(
    schemaRegistryService: SchemaRegistryGateway,
    userEventPublisher: UserEventPublisher,
    deadLetterKafkaProducer: DeadLetterKafkaProducer,
  ) {
    super(schemaRegistryService, userEventPublisher, deadLetterKafkaProducer);
  }

  @EventPattern(PROPERTIES.KAFKA.KEYCLOAK.USER_TOPIC)
  async execute(@Ctx() context: KafkaContext) {
    await super.execute(context);
  }

  protected handleMessage(
    decodedMessage: UserChangeEventEnvelope,
  ): UserChangeEvent {
    if (decodedMessage.op === PROPERTIES.USER.EVENTS.CREATE.OPERATION) {
      this.logger.log(
        `Skipping additional create message, trying to capture 'create' event from 'u' operation`,
      );
      this.shouldSkipMessage = true;
      return UserChangeEvent.from(decodedMessage);
    }

    const isCreatedEvent =
      decodedMessage.op === PROPERTIES.USER.EVENTS.UPDATE.OPERATION &&
      decodedMessage.before?.email === null;

    if (isCreatedEvent) {
      this.logger.log(
        `Detected 'create' event from 'u' operation, normalizing to 'c' operation`,
      );
      decodedMessage.op = PROPERTIES.USER.EVENTS.CREATE.OPERATION;
    }

    this.logger.log(`Handling operation '${decodedMessage.op}'`);

    return UserChangeEvent.from(decodedMessage);
  }
}
