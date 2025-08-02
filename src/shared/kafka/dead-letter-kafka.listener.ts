import { Injectable, Logger } from '@nestjs/common';
import { DeadLetterKafkaProducer } from '@shared/kafka/dead-letter-kafka.producer';
import { OnEvent } from '@nestjs/event-emitter';
import { PROPERTIES } from '@app/app.properties';
import { DeadLetterEvent } from '@shared/kafka/dead-letter.event';

@Injectable()
export class DeadLetterKafkaListener {
  private readonly logger: Logger = new Logger(DeadLetterKafkaListener.name);

  constructor(private readonly dlqKafkaProducer: DeadLetterKafkaProducer) {}

  @OnEvent(PROPERTIES.KAFKA.EVENTS.DLQ_PUBLISHED_EVENT)
  async handleDlqMessage(event: DeadLetterEvent): Promise<void> {
    this.logger.log(
      `Received dead letter event, topic: ${event.topic}, partition: ${event.partition}, offset: ${event.offset}`,
    );

    try {
      await this.dlqKafkaProducer.send(
        PROPERTIES.KAFKA.KEYCLOAK.USER_DLQ_TOPIC,
        event,
      );
      this.logger.log(
        `Dead letter message sent successfully, topic: ${event.topic}, partition: ${event.partition}, offset: ${event.offset}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send dead letter message, topic: ${event.topic}, partition: ${event.partition}, offset: ${event.offset}`,
        error.message,
        error.stack,
      );
    }
  }
}
