import { Inject, Injectable, Logger } from '@nestjs/common';
import { logError } from '@shared/logger/log-error';
import { EventPublisher } from '@shared/publishers/event.publisher';
import {
  USER_EVENT_STRATEGY,
  UserEventStrategy,
} from '@modules/user/application/publishers/user-event.strategy';

@Injectable()
export class UserEventPublisher implements EventPublisher {
  private readonly logger = new Logger(UserEventPublisher.name);

  constructor(
    @Inject(USER_EVENT_STRATEGY)
    private readonly strategies: UserEventStrategy[],
  ) {}

  async publish(event: Record<string, any>): Promise<void> {
    const strategy = this.strategies.find((s) => s.supports(event.op));

    if (!strategy) {
      throw new Error(`Unhandled operation: ${event.op}`);
    }

    try {
      await strategy.handle(event.data);
    } catch (error) {
      logError(`Error publishing user event`, error, this.logger);
      throw error;
    }
  }
}
