import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';
import { logError } from '@shared/logger/log-error';
import { InvalidUserEventError } from '@modules/user/application/errors/invalid-user-event.error';
import { UserEventStrategy } from '@modules/user/application/publishers/user-event.strategy';

@Injectable()
export class UserCreatedEventStrategy implements UserEventStrategy {
  private readonly logger = new Logger(UserCreatedEventStrategy.name);
  private static readonly OPERATION = 'create';
  public static readonly EVENT_NAME = 'user.created';

  constructor(private readonly eventEmitter: EventEmitter2) {}

  supports(operation: string): boolean {
    return operation === UserCreatedEventStrategy.OPERATION;
  }

  async handle(event: Record<string, any>): Promise<void> {
    try {
      const userCreatedEvent = UserCreatedEvent.fromJson(event);
      this.logger.log(
        `Publishing user created event for Keycloak ID: ${userCreatedEvent.keycloakId}`,
      );
      await this.eventEmitter.emitAsync(
        UserCreatedEventStrategy.EVENT_NAME,
        userCreatedEvent,
      );
    } catch (error) {
      logError(`Error publishing user created event`, error, this.logger);
      throw InvalidUserEventError;
    }
  }
}
