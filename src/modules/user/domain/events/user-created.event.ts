import { UserChangeEventValue } from '@modules/user/adapters/inbound/user-change.event';

export class UserCreatedEvent {
  readonly keycloakId: string;
  readonly username: string;
  readonly email: string;
  readonly name: string;
  readonly lastName: string;

  constructor(
    keycloakId: string,
    username: string,
    email: string,
    name: string,
    lastName: string,
  ) {
    this.keycloakId = keycloakId;
    this.username = username;
    this.email = email;
    this.name = name;
    this.lastName = lastName;
  }

  static fromUserChangeEvent(event: UserChangeEventValue): UserCreatedEvent {
    if (!event) {
      throw new Error('Invalid user event value');
    }

    return new UserCreatedEvent(
      event.id,
      event.username!,
      event.email!,
      event.first_name!,
      event.last_name!,
    );
  }
}
