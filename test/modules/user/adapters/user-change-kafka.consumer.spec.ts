/* eslint-disable @typescript-eslint/unbound-method */

import { UserChangeKafkaConsumer } from '@modules/user/adapters/inbound/consumers/user-change-kafka.consumer';
import { UserEventPublisher } from '@modules/user/application/publishers/user-event.publisher';
import { Test, TestingModule } from '@nestjs/testing';
import { SchemaRegistryGateway } from '@shared/kafka/schema-registry.gateway';
import { DeadLetterKafkaProducer } from '@shared/kafka/dead-letter-kafka.producer';
import { PROPERTIES } from '@app/app.properties';

describe('UserChangeKafkaConsumer Unit Tests', () => {
  let module: TestingModule;
  let consumer: UserChangeKafkaConsumer;
  let schemaRegistryService: SchemaRegistryGateway;
  let userEventPublisher: UserEventPublisher;
  let deadLetterKafkaProducer: DeadLetterKafkaProducer;
  let kafkaContextMock: any;
  let messageMock: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserChangeKafkaConsumer,
        {
          provide: SchemaRegistryGateway,
          useValue: { decode: jest.fn() },
        },
        {
          provide: UserEventPublisher,
          useValue: { publish: jest.fn() },
        },
        {
          provide: DeadLetterKafkaProducer,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    consumer = module.get<UserChangeKafkaConsumer>(UserChangeKafkaConsumer);
    schemaRegistryService = module.get<SchemaRegistryGateway>(
      SchemaRegistryGateway,
    );
    userEventPublisher = module.get<UserEventPublisher>(UserEventPublisher);
    deadLetterKafkaProducer = module.get<DeadLetterKafkaProducer>(
      DeadLetterKafkaProducer,
    );

    kafkaContextMock = {
      getTopic: jest.fn().mockReturnValue('user-topic'),
      getPartition: jest.fn(),
      getArgs: jest.fn(),
      getConsumer: jest.fn().mockReturnValue({ commitOffsets: jest.fn() }),
    };

    messageMock = {
      offset: '0',
      value: Buffer.from(''),
      headers: {},
    };
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  it('should skip create event when op is "c"', async () => {
    const envelope = {
      op: PROPERTIES.USER.EVENTS.CREATE.OPERATION,
      before: null,
      after: { email: 'test@email.com' },
    };

    messageMock.value = Buffer.from(JSON.stringify(envelope));

    schemaRegistryService.decode = jest.fn().mockResolvedValue(envelope);
    kafkaContextMock.getMessage = jest.fn().mockReturnValue(messageMock);

    await consumer.execute(kafkaContextMock);

    expect(schemaRegistryService.decode).toHaveBeenCalledWith(
      messageMock.value,
    );
    expect(userEventPublisher.publish).not.toHaveBeenCalled();
    expect(deadLetterKafkaProducer.send).not.toHaveBeenCalled();
  });

  it('should normalize create event when op is "u" and before email is null', async () => {
    const envelope = {
      op: PROPERTIES.USER.EVENTS.UPDATE.OPERATION,
      before: { email: null },
      after: { email: 'test@email.com' },
    };

    messageMock.value = Buffer.from(JSON.stringify(envelope));

    schemaRegistryService.decode = jest.fn().mockResolvedValue(envelope);
    kafkaContextMock.getMessage = jest.fn().mockReturnValue(messageMock);

    await consumer.execute(kafkaContextMock);

    expect(schemaRegistryService.decode).toHaveBeenCalledWith(
      messageMock.value,
    );
    expect(userEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        envelope: expect.objectContaining({
          op: PROPERTIES.USER.EVENTS.CREATE.OPERATION,
        }),
      }),
    );
    expect(kafkaContextMock.getConsumer().commitOffsets).toHaveBeenCalledWith([
      {
        topic: 'user-topic',
        partition: undefined,
        offset: '1',
      },
    ]);
    expect(deadLetterKafkaProducer.send).not.toHaveBeenCalled();
  });

  it('should handle regular update event', async () => {
    const envelope = {
      op: PROPERTIES.USER.EVENTS.UPDATE.OPERATION,
      before: { email: 'test@test.com' },
      after: { email: 'test2@test.com' },
    };

    messageMock.value = Buffer.from(JSON.stringify(envelope));

    schemaRegistryService.decode = jest.fn().mockResolvedValue(envelope);
    kafkaContextMock.getMessage = jest.fn().mockReturnValue(messageMock);

    await consumer.execute(kafkaContextMock);

    expect(schemaRegistryService.decode).toHaveBeenCalledWith(
      messageMock.value,
    );
    expect(userEventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        envelope: expect.objectContaining({
          op: PROPERTIES.USER.EVENTS.UPDATE.OPERATION,
        }),
      }),
    );
    expect(kafkaContextMock.getConsumer().commitOffsets).toHaveBeenCalledWith([
      {
        topic: 'user-topic',
        partition: undefined,
        offset: '1',
      },
    ]);
    expect(deadLetterKafkaProducer.send).not.toHaveBeenCalled();
  });

  it('should handle error and send to DLQ', async () => {
    const envelope = {
      op: PROPERTIES.USER.EVENTS.UPDATE.OPERATION,
      before: { email: 'test@test.com' },
      after: { email: 'test2@test.com' },
    };

    messageMock.value = Buffer.from(JSON.stringify(envelope));
    schemaRegistryService.decode = jest.fn().mockResolvedValue(envelope);
    kafkaContextMock.getMessage = jest.fn().mockReturnValue(messageMock);
    userEventPublisher.publish = jest
      .fn()
      .mockRejectedValue(new Error('Test error'));

    await consumer.execute(kafkaContextMock);

    expect(schemaRegistryService.decode).toHaveBeenCalledWith(
      messageMock.value,
    );
    expect(userEventPublisher.publish).toHaveBeenCalled();
    expect(deadLetterKafkaProducer.send).toHaveBeenCalledWith(
      PROPERTIES.KAFKA.KEYCLOAK.USER_DLQ_TOPIC,
      expect.objectContaining({
        originalValue: messageMock.value.toString(),
        errorMessage: 'Test error',
        topic: 'user-topic',
        offset: '0',
        originalHeaders: messageMock.headers,
        originalKey: null,
        partition: undefined,
        traceId: expect.any(String),
        errorStack: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
    expect(kafkaContextMock.getConsumer().commitOffsets).toHaveBeenCalledWith([
      {
        topic: 'user-topic',
        partition: undefined,
        offset: '1',
      },
    ]);
  });
});
