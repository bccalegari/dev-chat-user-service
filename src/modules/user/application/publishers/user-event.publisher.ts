import { Inject, Injectable, Logger } from '@nestjs/common';
import { logError } from '@shared/logging/log-error';
import { EventPublisher } from '@shared/publishers/event.publisher';
import {
  USER_EVENT_STRATEGY,
  UserEventStrategy,
} from '@modules/user/application/publishers/user-event.strategy';
import { UserChangeEventEnvelope } from '@modules/user/adapters/inbound/user-change.event';

@Injectable()
export class UserEventPublisher
  implements EventPublisher<UserChangeEventEnvelope>
{
  private readonly logger = new Logger(UserEventPublisher.name);

  constructor(
    @Inject(USER_EVENT_STRATEGY)
    private readonly strategies: UserEventStrategy[],
  ) {}

  async publish(event: UserChangeEventEnvelope): Promise<void> {
    const strategy = this.strategies.find((s) => s.supports(event.op));

    if (!strategy) {
      throw new Error(`Unhandled operation: ${event.op}`);
    }

    try {
      await strategy.handle(event.after);
    } catch (error) {
      logError(`Error publishing user event`, error, this.logger);
      throw error;
    }
  }
}
