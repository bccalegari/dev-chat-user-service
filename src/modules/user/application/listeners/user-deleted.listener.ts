import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from '@modules/user/domain/entities/user';
import { logError } from '@shared/logging/log-error';
import { UserNotFoundException } from '@modules/user/application/exceptions/user-not-found.exception';
import { DeadLetterEvent } from '@shared/kafka/dead-letter.event';
import { TraceService } from '@shared/tracing/trace.service';
import { KafkaMessage } from '@shared/kafka/kafka-message';
import { DeadLetterKafkaPublisher } from '@shared/kafka/dead-letter-kafka-publisher';
import { PROPERTIES } from '@app/app.properties';
import { UserDeletedEvent } from '@modules/user/domain/events/user-deleted.event';

@Injectable()
export class UserDeletedListener {
  private readonly logger = new Logger(UserDeletedListener.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: UserRepository,
    private readonly deadLetterKafkaPublisher: DeadLetterKafkaPublisher,
  ) {}

  @OnEvent(PROPERTIES.USER.EVENTS.DELETE.NAME)
  async execute(
    event: UserDeletedEvent,
    kafkaMessage: KafkaMessage,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received user deleted event, keycloakId=${event.keycloakId}`,
      );
      const user = await this.findByKeycloakId(event.keycloakId);
      user.delete(event.deletedAt);
      await this.repository.delete(user);
      this.logger.log(
        `User deleted successfully, id=${user.id}, keycloakId=${user.keycloakId}`,
      );
    } catch (error) {
      logError(
        `Error deleting user, keycloakId=${event.keycloakId}`,
        error,
        this.logger,
      );
      await this.deadLetterKafkaPublisher.publish(
        DeadLetterEvent.from(kafkaMessage, error, TraceService.getTraceId()),
      );
    }
  }

  private async findByKeycloakId(keycloakId: string): Promise<User> {
    const user = await this.repository.findByKeycloakId(keycloakId);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }
}
