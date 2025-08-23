import { UserChangeEventValue } from '@modules/user/adapters/inbound/consumers/user-change.event';
import { UserUpdatedEvent } from '@modules/user/domain/events/user-updated.event';

export class UserUpdatedEventMapper {
  static from(event: UserChangeEventValue): UserUpdatedEvent {
    if (!event) throw new Error('Invalid user event');
    return new UserUpdatedEvent(
      event.id,
      event.email!,
      event.first_name!,
      event.last_name!,
      new Date(),
    );
  }
}
