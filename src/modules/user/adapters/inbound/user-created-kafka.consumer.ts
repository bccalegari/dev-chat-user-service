import { Controller, Logger } from '@nestjs/common';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { UserEventPublisher } from '@modules/user/application/publishers/user-event.publisher';
import { DlqKafkaProducer } from '@shared/kafka/dlq-kafka.producer';
import { Ctx, EventPattern, KafkaContext } from '@nestjs/microservices';
import { AbstractKafkaConsumer } from '@shared/kafka/kafka.consumer.abstract';
import { UserChangeEventEnvelope } from '@modules/user/adapters/inbound/user-change.event';
import { USER_EVENTS_OPERATIONS } from '@modules/user/application/user-events.contant';
import { PROPERTIES } from '@app/app.properties';

@Controller()
export class UserCreatedKafkaConsumer extends AbstractKafkaConsumer<
  UserChangeEventEnvelope,
  UserChangeEventEnvelope
> {
  private readonly logger = new Logger(UserCreatedKafkaConsumer.name);
  override DLQ_TOPIC: string = PROPERTIES.KAFKA.KEYCLOAK_USER_DLQ_TOPIC;

  constructor(
    schemaRegistryService: SchemaRegistryGateway,
    userEventPublisher: UserEventPublisher,
    dlqKafkaProducer: DlqKafkaProducer,
  ) {
    super(schemaRegistryService, userEventPublisher, dlqKafkaProducer);
  }

  @EventPattern(PROPERTIES.KAFKA.KEYCLOAK_USER_TOPIC)
  async execute(@Ctx() context: KafkaContext) {
    await super.execute(context);
  }

  protected handleMessage(
    decodedMessage: UserChangeEventEnvelope,
  ): UserChangeEventEnvelope {
    if (decodedMessage.op === USER_EVENTS_OPERATIONS.create) {
      this.logger.log(
        `Skipping additional create message, trying to capture 'create' event from 'u' operation`,
      );
      this.shouldSkipMessage = true;
      return decodedMessage;
    }

    const isCreatedEvent =
      decodedMessage.op === USER_EVENTS_OPERATIONS.update &&
      decodedMessage.before === null;

    if (isCreatedEvent) {
      this.logger.log(
        `Detected 'create' event from 'u' operation with no 'before' state, normalizing to 'c' operation`,
      );
      decodedMessage.op = USER_EVENTS_OPERATIONS.create;
    }

    this.logger.log(`Handling operation: ${decodedMessage.op}`);

    return decodedMessage;
  }
}
