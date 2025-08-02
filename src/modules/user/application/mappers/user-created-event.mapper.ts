import { UserChangeEventValue } from '@modules/user/adapters/inbound/user-change.event';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';

export class UserCreatedEventMapper {
  static from(event: UserChangeEventValue): UserCreatedEvent {
    if (!event) throw new Error('Invalid user event');
    return new UserCreatedEvent(
      event.id,
      event.username!,
      event.email!,
      event.first_name!,
      event.last_name!,
      new Date(),
    );
  }
}
