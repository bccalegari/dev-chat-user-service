import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { logError } from '@shared/logging/log-error';
import { InvalidUserEventError } from '@modules/user/application/exceptions/invalid-user-event.error';
import { UserEventPublisherStrategy } from '@modules/user/application/publishers/user-event-publisher.strategy';
import { UserChangeEventValue } from '@modules/user/adapters/inbound/consumers/user-change.event';
import { PROPERTIES } from '@app/app.properties';
import { KafkaMessage } from '@shared/kafka/kafka-message';
import { UserCreatedEventMapper } from '@modules/user/application/mappers/user-created-event.mapper';

@Injectable()
export class UserCreatedEventPublisher implements UserEventPublisherStrategy {
  private readonly logger = new Logger(UserCreatedEventPublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  supports(operation: string): boolean {
    return operation === PROPERTIES.USER.EVENTS.CREATE.OPERATION;
  }

  async handle(
    event: UserChangeEventValue,
    kafkaMessage: KafkaMessage,
  ): Promise<void> {
    try {
      const userCreatedEvent = UserCreatedEventMapper.from(event);
      this.logger.log(
        `Publishing user created event, keycloakId=${userCreatedEvent.keycloakId}`,
      );
      await this.eventEmitter.emitAsync(
        PROPERTIES.USER.EVENTS.CREATE.NAME,
        userCreatedEvent,
        kafkaMessage,
      );
    } catch (error) {
      logError(`Error publishing user created event`, error, this.logger);
      throw new InvalidUserEventError(error);
    }
  }
}
