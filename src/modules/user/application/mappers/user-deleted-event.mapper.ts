import { UserChangeEventValue } from '@modules/user/adapters/inbound/user-change.event';
import { UserDeletedEvent } from '@modules/user/domain/events/user-deleted.event';

export class UserDeletedEventMapper {
  static from(event: UserChangeEventValue): UserDeletedEvent {
    if (!event) throw new Error('Invalid user event');
    return new UserDeletedEvent(event.id, new Date());
  }
}
