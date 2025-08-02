import { KafkaMessage } from '@shared/kafka/kafka-message';

export class DeadLetterEvent {
  constructor(
    readonly originalKey: string | null,
    readonly originalValue: string | null,
    readonly originalHeaders: Record<string, any>,
    readonly traceId: string,
    readonly errorMessage: string,
    readonly errorStack: string | null,
    readonly topic: string,
    readonly partition: number,
    readonly offset: string,
    readonly timestamp: string,
  ) {}

  static from(
    metadata: KafkaMessage,
    error: Error,
    traceId?: string,
  ): DeadLetterEvent {
    return new DeadLetterEvent(
      metadata.key,
      metadata.value,
      metadata.headers || {},
      traceId || 'No trace id available',
      error.message || 'Unknown error',
      error.stack || 'No stack trace available',
      metadata.topic,
      metadata.partition,
      metadata.offset,
      new Date().toISOString(),
    );
  }
}
