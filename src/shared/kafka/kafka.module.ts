import { Module } from '@nestjs/common';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { DeadLetterKafkaProducer } from '@shared/kafka/dead-letter-kafka.producer';
import { DeadLetterKafkaPublisher } from '@shared/kafka/dead-letter-kafka-publisher';
import { DeadLetterKafkaListener } from '@shared/kafka/dead-letter-kafka.listener';

@Module({
  providers: [
    SchemaRegistryGateway,
    DeadLetterKafkaProducer,
    DeadLetterKafkaPublisher,
    DeadLetterKafkaListener,
  ],
  exports: [
    SchemaRegistryGateway,
    DeadLetterKafkaProducer,
    DeadLetterKafkaPublisher,
  ],
})
export class KafkaModule {}
