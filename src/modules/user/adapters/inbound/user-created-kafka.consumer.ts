import { Controller, Logger } from '@nestjs/common';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { UserEventPublisher } from '@modules/user/application/publishers/user-event.publisher';
import { DlqKafkaProducer } from '@shared/kafka/dlq-kafka.producer';
import { Ctx, EventPattern, KafkaContext } from '@nestjs/microservices';
import {
  KEYCLOAK_USER_DLQ_TOPIC,
  KEYCLOAK_USER_TOPIC,
} from '@modules/user/user.topics';
import { AbstractKafkaConsumer } from '@shared/kafka/kafka.consumer.abstract';

@Controller()
export class UserCreatedKafkaConsumer extends AbstractKafkaConsumer {
  private readonly logger = new Logger(UserCreatedKafkaConsumer.name);
  override DLQ_TOPIC: string = KEYCLOAK_USER_DLQ_TOPIC;

  constructor(
    schemaRegistryService: SchemaRegistryGateway,
    userEventPublisher: UserEventPublisher,
    dlqKafkaProducer: DlqKafkaProducer,
  ) {
    super(schemaRegistryService, userEventPublisher, dlqKafkaProducer);
  }

  @EventPattern(KEYCLOAK_USER_TOPIC)
  async execute(@Ctx() context: KafkaContext) {
    await super.execute(context);
  }

  protected handleMessage(decodedMessage: Record<string, any>): any {
    const operations = {
      c: 'create',
      u: 'update',
      d: 'delete',
    };
    let operation = decodedMessage.op;

    if (operation === 'c') {
      this.logger.log(
        `Skipping additional create message, trying to capture 'create' event from 'u' operation`,
      );
      return this.SKIP_MESSAGE_FLAG;
    }

    const isCreatedEvent =
      decodedMessage.op === 'u' && decodedMessage.before === null;

    if (isCreatedEvent) {
      this.logger.log(
        `Detected 'create' event from 'u' operation with no 'before' state`,
      );
      operation = 'create';
    } else {
      operation = operations[decodedMessage.op];
      this.logger.log(`Handling operation: ${operation}`);
    }

    return {
      data: decodedMessage.after,
      op: operation,
    };
  }
}
