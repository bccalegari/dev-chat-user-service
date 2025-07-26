import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY } from '@modules/user/user.tokens';
import { UserRepository } from '@modules/user/domain/repositories/user.repository.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';
import { User } from '@modules/user/domain/entities/user';
import { logError } from '@shared/logger/log-error';
import { UserCreatedEventStrategy } from '@modules/user/application/publishers/user-created-event.publisher';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: UserRepository,
  ) {}

  @OnEvent(UserCreatedEventStrategy.EVENT_NAME)
  async execute(userDto: UserCreatedEvent): Promise<void> {
    try {
      const user = User.fromUserCreatedEvent(userDto);
      await this.repository.createUser(user);
      this.logger.log(
        `User with keycloak ID ${userDto.keycloakId} created successfully with ID: ${user.id}`,
      );
    } catch (error) {
      logError(
        `Error creating user with keycloak ID: ${userDto.keycloakId}`,
        error,
        this.logger,
      );
      throw error;
    }
  }
}
