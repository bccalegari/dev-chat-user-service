import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { LoggerFactory } from '@shared/logging/logger.factory';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory('user-service'),
  });

  const configService = app.get(ConfigService);
  const kafkaBrokers = configService.get<string>('KAFKA_BROKERS')!.split(',');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: 'user-service-group',
        allowAutoTopicCreation: true,
        retry: {
          initialRetryTime: 1000,
          retries: 10,
          factor: 2,
        },
      },
      run: {
        autoCommit: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
