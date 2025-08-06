import { Logger } from '@nestjs/common';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { DeadLetterKafkaProducer } from '@shared/kafka/dead-letter-kafka.producer';
import { EventPublisher } from '@shared/publishers/event.publisher';
import { KafkaContext } from '@nestjs/microservices';
import { safeStringify } from '@shared/utils/safe-stringify';
import { logError } from '@shared/logging/log-error';
import { Traceable } from '@shared/tracing/trace.decorator';
import { TraceService } from '@shared/tracing/trace.service';
import { KafkaMessage } from '@shared/kafka/kafka-message';
import { KafkaEvent } from '@shared/kafka/kafka-event';

export abstract class AbstractKafkaConsumer<T, U extends KafkaEvent> {
  private readonly _logger = new Logger(AbstractKafkaConsumer.name);
  protected abstract DLQ_TOPIC: string;
  protected shouldSkipMessage: boolean = false;

  protected constructor(
    private readonly schemaRegistryService: SchemaRegistryGateway,
    private readonly eventPublisher: EventPublisher<U>,
    private readonly deadLetterKafkaProducer: DeadLetterKafkaProducer,
  ) {}

  @Traceable()
  protected async execute(context: KafkaContext) {
    this._logger.log(
      `Received message, topic=${context.getTopic()}, partition=${context.getPartition()}, offset=${context.getMessage().offset}, headers=${JSON.stringify(context.getMessage().headers)}`,
    );

    const message = context.getMessage();
    const offset = message.offset;
    const nextOffset = parseInt(offset, 10) + 1;

    try {
      const decodedMessage: T = await this.schemaRegistryService.decode(
        message.value,
      );
      this._logger.log(
        `Message decoded successfully, value=${safeStringify(decodedMessage)}`,
      );

      const event = this.handleMessage(decodedMessage);

      if (this.shouldSkipMessage) {
        this._logger.log(
          `Skipping message, topic=${context.getTopic()}, partition=${context.getPartition()}, offset=${offset}`,
        );
        return;
      }

      event.kafkaMessage = KafkaMessage.from(context);

      await this.eventPublisher.publish(event);
      await this.commitOffset(context, nextOffset.toString());
    } catch (error) {
      logError('Error processing kafka message', error, this._logger);
      await this.handleError(context, error);
      await this.commitOffset(context, nextOffset.toString());
    } finally {
      this.resetSkipMessageFlag();
    }
  }

  protected abstract handleMessage(decodedMessage: T): U;

  private resetSkipMessageFlag() {
    this.shouldSkipMessage = false;
    this._logger.log("Resetting 'shouldSkipMessage' flag to false");
  }

  private async commitOffset(context: KafkaContext, offset: string) {
    const topic = context.getTopic();
    const partition = context.getPartition();

    try {
      await context.getConsumer().commitOffsets([
        {
          topic,
          partition,
          offset,
        },
      ]);
      this._logger.log(
        `Offset committed, topic=${topic}, partition=${partition}, offset=${offset}`,
      );
    } catch (error) {
      logError('Error committing offset', error, this._logger);
      throw error;
    }
  }

  private async handleError(context: KafkaContext, error: Error) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    const dlqPayload = {
      originalKey: context.getMessage().key?.toString() ?? null,
      originalValue: context.getMessage().value?.toString() ?? null,
      originalHeaders: context.getMessage().headers,
      traceId: TraceService.getTraceId() || 'No trace id available',
      errorMessage: error.message || 'Unknown error',
      errorStack: error.stack || 'No stack trace available',
      topic: topic,
      partition: partition,
      offset: offset,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.deadLetterKafkaProducer.send(this.DLQ_TOPIC, dlqPayload);
      this._logger.log(
        `Message sent to dlq, topic=${topic}, partition=${partition}, offset=${offset}`,
      );
    } catch (dlqError) {
      logError('Failed to send message to dlq', dlqError, this._logger);
    }
  }
}
