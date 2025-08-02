export class UserUpdatedEvent {
  constructor(
    readonly keycloakId: string,
    readonly username: string,
    readonly email: string,
    readonly name: string,
    readonly lastName: string,
    readonly updatedAt: Date,
  ) {}
}
