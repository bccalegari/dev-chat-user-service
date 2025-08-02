import { Inject, Injectable, Logger } from '@nestjs/common';
import { logError } from '@shared/logging/log-error';
import { EventPublisher } from '@shared/publishers/event.publisher';
import {
  USER_EVENT_STRATEGY,
  UserEventStrategy,
} from '@modules/user/application/publishers/user-event.strategy';
import { UserChangeEvent } from '@modules/user/adapters/inbound/user-change.event';

@Injectable()
export class UserEventPublisher implements EventPublisher<UserChangeEvent> {
  private readonly logger = new Logger(UserEventPublisher.name);

  constructor(
    @Inject(USER_EVENT_STRATEGY)
    private readonly strategies: UserEventStrategy[],
  ) {}

  async publish(event: UserChangeEvent): Promise<void> {
    const envelope = event.envelope;
    const strategy = this.strategies.find((s) => s.supports(envelope.op));

    if (!strategy) {
      throw new Error(`Unhandled operation '${envelope.op}'`);
    }

    try {
      await strategy.handle(envelope.after, event.kafkaMessage);
    } catch (error) {
      logError(`Error publishing user event`, error, this.logger);
      throw error;
    }
  }
}
