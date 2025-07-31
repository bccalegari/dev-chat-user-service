import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';
import { logError } from '@shared/logging/log-error';
import { InvalidUserEventError } from '@modules/user/application/errors/invalid-user-event.error';
import { UserEventStrategy } from '@modules/user/application/publishers/user-event.strategy';
import {
  USER_EVENTS_OPERATIONS,
  USER_EVENTS,
} from '@modules/user/application/user-events.contant';
import { UserChangeEventValue } from '@modules/user/adapters/inbound/user-change.event';

@Injectable()
export class UserCreatedEventStrategy implements UserEventStrategy {
  private readonly logger = new Logger(UserCreatedEventStrategy.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  supports(operation: string): boolean {
    return operation === USER_EVENTS_OPERATIONS.create;
  }

  async handle(event: UserChangeEventValue): Promise<void> {
    try {
      const userCreatedEvent = UserCreatedEvent.fromUserChangeEvent(event);
      this.logger.log(
        `Publishing user created event for Keycloak ID: ${userCreatedEvent.keycloakId}`,
      );
      await this.eventEmitter.emitAsync(USER_EVENTS.create, userCreatedEvent);
    } catch (error) {
      logError(`Error publishing user created event`, error, this.logger);
      throw InvalidUserEventError;
    }
  }
}
