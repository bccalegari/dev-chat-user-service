import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer } from '@shared/kafka/kafka.producer.abstract';
import { ConfigService } from '@nestjs/config';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { logError } from '@shared/logger/log-error';

@Injectable()
export class DlqKafkaProducer extends KafkaProducer {
  private readonly logger = new Logger(DlqKafkaProducer.name);
  private readonly DLQ_SUBJECT = 'DlqPayload-value';

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
    this.logger.log(`Sending message to DLQ topic=${topic}`);
    try {
      await this.emit(topic, this.DLQ_SUBJECT, message);
      this.logger.log(`Message sent to DLQ topic=${topic}`);
    } catch (error) {
      logError(
        `Error sending message to DLQ topic=${topic}`,
        error,
        this.logger,
      );
    }
  }

  override async onModuleDestroy() {
    await super.onModuleDestroy();
  }
}
