import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { logError } from '@shared/logging/log-error';
import { InvalidUserEventError } from '@modules/user/application/exceptions/invalid-user-event.error';
import { UserChangeEventValue } from '@modules/user/adapters/inbound/consumers/user-change.event';
import { PROPERTIES } from '@app/app.properties';
import { KafkaMessage } from '@shared/kafka/kafka-message';
import { UserEventPublisherStrategy } from '@modules/user/application/publishers/user-event-publisher.strategy';
import { UserDeletedEventMapper } from '@modules/user/application/mappers/user-deleted-event.mapper';

@Injectable()
export class UserDeletedEventPublisher implements UserEventPublisherStrategy {
  private readonly logger = new Logger(UserDeletedEventPublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  supports(operation: string): boolean {
    return operation === PROPERTIES.USER.EVENTS.DELETE.OPERATION;
  }

  async handle(
    event: UserChangeEventValue,
    kafkaMessage: KafkaMessage,
  ): Promise<void> {
    try {
      const userDeletedEvent = UserDeletedEventMapper.from(event);
      this.logger.log(
        `Publishing user deleted event, keycloakId=${userDeletedEvent.keycloakId}`,
      );
      await this.eventEmitter.emitAsync(
        PROPERTIES.USER.EVENTS.DELETE.NAME,
        userDeletedEvent,
        kafkaMessage,
      );
    } catch (error) {
      logError(`Error publishing user deleted event`, error, this.logger);
      throw new InvalidUserEventError(error);
    }
  }
}
