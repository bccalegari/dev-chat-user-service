import { Inject, Injectable, Logger } from '@nestjs/common';
import { logError } from '@shared/logging/log-error';
import { EventPublisher } from '@shared/publishers/event.publisher';
import {
  USER_EVENT_STRATEGY,
  UserEventPublisherStrategy,
} from '@modules/user/application/publishers/user-event-publisher.strategy';
import { UserChangeEvent } from '@modules/user/adapters/inbound/user-change.event';
import { PROPERTIES } from '@app/app.properties';

@Injectable()
export class UserEventPublisher implements EventPublisher<UserChangeEvent> {
  private readonly logger = new Logger(UserEventPublisher.name);

  constructor(
    @Inject(USER_EVENT_STRATEGY)
    private readonly strategies: UserEventPublisherStrategy[],
  ) {}

  async publish(event: UserChangeEvent): Promise<void> {
    const envelope = event.envelope;
    const strategy = this.strategies.find((s) => s.supports(envelope.op));

    if (!strategy) {
      throw new Error(`Unhandled operation '${envelope.op}'`);
    }

    try {
      let envelopeValue = envelope.after;

      if (envelope.op === PROPERTIES.USER.EVENTS.DELETE.OPERATION) {
        envelopeValue = envelope.before;
      }

      await strategy.handle(envelopeValue, event.kafkaMessage);
    } catch (error) {
      logError(`Error publishing user event`, error, this.logger);
      throw error;
    }
  }
}
