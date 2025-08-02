import { Injectable, Logger } from '@nestjs/common';
import { EventPublisher } from '@shared/publishers/event.publisher';
import { DeadLetterEvent } from '@shared/kafka/dead-letter.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PROPERTIES } from '@app/app.properties';

@Injectable()
export class DeadLetterKafkaPublisher
  implements EventPublisher<DeadLetterEvent>
{
  private readonly logger: Logger = new Logger(DeadLetterKafkaPublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(event: DeadLetterEvent): Promise<void> {
    try {
      this.logger.log(
        `Publishing dead letter event, topic=${event.topic}, partition=${event.partition}, offset=${event.offset}`,
      );
      await this.eventEmitter.emitAsync(
        PROPERTIES.KAFKA.EVENTS.DLQ_PUBLISHED_EVENT,
        event,
      );
    } catch (error) {
      this.logger.error(
        `Error publishing dead letter event, topic=${event.topic}, partition=${event.partition}, offset=${event.offset}`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }
}
