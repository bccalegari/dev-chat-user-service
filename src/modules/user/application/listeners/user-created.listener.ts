import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';
import { User } from '@modules/user/domain/entities/user';
import { logError } from '@shared/logging/log-error';
import { KafkaMessage } from '@shared/kafka/kafka-message';
import { DeadLetterKafkaPublisher } from '@shared/kafka/dead-letter-kafka-publisher';
import { TraceService } from '@shared/logging/trace.service';
import { DeadLetterEvent } from '@shared/kafka/dead-letter.event';
import { PROPERTIES } from '@app/app.properties';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: UserRepository,
    private readonly dlqKafkaPublisher: DeadLetterKafkaPublisher,
  ) {}

  @OnEvent(PROPERTIES.USER.EVENTS.CREATE.NAME)
  async execute(
    event: UserCreatedEvent,
    kafkaMessage: KafkaMessage,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received user created event, keycloakId=${event.keycloakId}`,
      );
      const user = User.create(event);
      await this.repository.create(user);
      this.logger.log(
        `User created successfully, id=${user.id}, keycloakId=${user.keycloakId}`,
      );
    } catch (error) {
      logError(
        `Error creating user, keycloakId=${event.keycloakId}`,
        error,
        this.logger,
      );
      await this.dlqKafkaPublisher.publish(
        DeadLetterEvent.from(kafkaMessage, error, TraceService.getTraceId()),
      );
    }
  }
}
