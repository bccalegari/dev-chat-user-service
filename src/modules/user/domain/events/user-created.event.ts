export class UserCreatedEvent {
  constructor(
    readonly keycloakId: string,
    readonly email: string,
    readonly name: string,
    readonly lastName: string,
    readonly createdAt: Date,
  ) {}
}
