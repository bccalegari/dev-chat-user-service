import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { logError } from '@shared/logging/log-error';
import { InvalidUserEventError } from '@modules/user/application/exceptions/invalid-user-event.error';
import { UserEventPublisherStrategy } from '@modules/user/application/publishers/user-event-publisher.strategy';
import { UserChangeEventValue } from '@modules/user/adapters/inbound/consumers/user-change.event';
import { PROPERTIES } from '@app/app.properties';
import { KafkaMessage } from '@shared/kafka/kafka-message';
import { UserUpdatedEventMapper } from '@modules/user/application/mappers/user-updated-event.mapper';

@Injectable()
export class UserUpdatedEventPublisher implements UserEventPublisherStrategy {
  private readonly logger = new Logger(UserUpdatedEventPublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  supports(operation: string): boolean {
    return operation === PROPERTIES.USER.EVENTS.UPDATE.OPERATION;
  }

  async handle(
    event: UserChangeEventValue,
    kafkaMessage: KafkaMessage,
  ): Promise<void> {
    try {
      const userUpdatedEvent = UserUpdatedEventMapper.from(event);
      this.logger.log(
        `Publishing user updated event, id=${userUpdatedEvent.userId}`,
      );
      await this.eventEmitter.emitAsync(
        PROPERTIES.USER.EVENTS.UPDATE.NAME,
        userUpdatedEvent,
        kafkaMessage,
      );
    } catch (error) {
      logError(`Error publishing user updated event`, error, this.logger);
      throw new InvalidUserEventError(error);
    }
  }
}
