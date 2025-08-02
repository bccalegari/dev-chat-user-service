import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { logError } from '@shared/logging/log-error';

export abstract class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly _logger = new Logger(KafkaProducer.name);

  protected constructor(
    private readonly configService: ConfigService,
    private readonly schemaRegistryGateway: SchemaRegistryGateway,
  ) {
    this.kafka = new Kafka({
      brokers: this.configService.get<string>('KAFKA_BROKERS')!.split(','),
      clientId: 'user-service',
    });

    this.producer = this.kafka.producer({
      idempotent: true,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  protected async emit<T>(
    topic: string,
    subject: string,
    message: T,
  ): Promise<void> {
    this._logger.log(`Encoding message, subject=${subject}`);

    const encodedValue = await this.schemaRegistryGateway.encode(
      subject,
      message,
    );

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: encodedValue,
          },
        ],
      });

      this._logger.log(`Message sent, topic=${topic}, subject=${subject}`);
    } catch (error) {
      logError(
        `Error sending message, topic=${topic}, subject=${subject}`,
        error,
        this._logger,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
