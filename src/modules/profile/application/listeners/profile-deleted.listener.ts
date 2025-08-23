import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { logError } from '@shared/logging/log-error';
import { PROPERTIES } from '@app/app.properties';
import {
  PROFILE_REPOSITORY,
  ProfileRepository,
} from '@modules/profile/domain/repositories/profile.repository.interface';
import { UserDeletedEvent } from '@modules/user/domain/events/user-deleted.event';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';

@Injectable()
export class ProfileDeletedListener {
  private readonly logger = new Logger(ProfileDeletedListener.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PROFILE_REPOSITORY) private readonly repository: ProfileRepository,
  ) {}

  @OnEvent(PROPERTIES.USER.EVENTS.DELETE.NAME)
  async execute(event: UserDeletedEvent): Promise<void> {
    const keycloakId = event.keycloakId;
    try {
      this.logger.log(
        `Received user deleted event for profile deletion, keycloakId=${keycloakId}`,
      );
      const user = await this.userRepository.findByKeycloakId(
        keycloakId,
        false,
      );

      if (!user) {
        this.logger.warn(`No user found, keycloakId=${keycloakId}`);
        return;
      }

      const profile = await this.repository.findByUserId(user.id, false);

      if (!profile) {
        this.logger.warn(`No profile found, userId=${user.id}`);
        return;
      }

      profile.delete();
      await this.repository.delete(profile);
      this.logger.log(`Profile deleted successfully, id=${profile.id}`);
    } catch (error) {
      logError(
        `Error deleting profile, keycloakId=${keycloakId}`,
        error,
        this.logger,
      );
    }
  }
}
