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

  static fromJson(json: Record<string, any>): UserCreatedEvent {
    return new UserCreatedEvent(
      json.id as string,
      json.username as string,
      json.email as string,
      json.first_name as string,
      json.last_name as string,
    );
  }
}
