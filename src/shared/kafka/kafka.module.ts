import { Module } from '@nestjs/common';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { DlqKafkaProducer } from '@shared/kafka/dlq-kafka.producer';

@Module({
  providers: [SchemaRegistryGateway, DlqKafkaProducer],
  exports: [SchemaRegistryGateway, DlqKafkaProducer],
})
export class KafkaModule {}
