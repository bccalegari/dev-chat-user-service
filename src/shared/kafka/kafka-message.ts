import { KafkaContext } from '@nestjs/microservices';

export class KafkaMessage {
  constructor(
    readonly key: string | null,
    readonly value: string | null,
    readonly topic: string,
    readonly partition: number,
    readonly offset: string,
    readonly headers?: Record<string, any>,
  ) {}

  static from(kafkaContext: KafkaContext): KafkaMessage {
    const message = kafkaContext.getMessage();
    return new KafkaMessage(
      message.key ? message.key.toString() : null,
      message.value ? message.value.toString() : null,
      kafkaContext.getTopic(),
      kafkaContext.getPartition(),
      message.offset.toString(),
      message.headers,
    );
  }
}
