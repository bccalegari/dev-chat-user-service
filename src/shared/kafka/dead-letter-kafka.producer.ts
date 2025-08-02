import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer } from '@shared/kafka/kafka.producer.abstract';
import { ConfigService } from '@nestjs/config';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { logError } from '@shared/logging/log-error';
import { PROPERTIES } from '@app/app.properties';

@Injectable()
export class DeadLetterKafkaProducer extends KafkaProducer {
  private readonly logger = new Logger(DeadLetterKafkaProducer.name);

  constructor(
    configService: ConfigService,
    schemaRegistryGateway: SchemaRegistryGateway,
  ) {
    super(configService, schemaRegistryGateway);
  }

  override async onModuleInit() {
    await super.onModuleInit();
  }

  async send<T>(topic: string, message: T): Promise<void> {
    this.logger.log(
      `Sending message to dlq, topic=${topic}, message=${JSON.stringify(message)}`,
    );
    try {
      await this.emit(
        topic,
        PROPERTIES.KAFKA.SCHEMA_REGISTRY.DLQ_SUBJECT,
        message,
      );
      this.logger.log(`Message sent to dlq, topic=${topic}`);
    } catch (error) {
      logError(
        `Error sending message to dlq, topic=${topic}`,
        error,
        this.logger,
      );
      throw error;
    }
  }

  override async onModuleDestroy() {
    await super.onModuleDestroy();
  }
}
