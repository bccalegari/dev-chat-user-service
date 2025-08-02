export class UserDeletedEvent {
  constructor(
    readonly keycloakId: string,
    readonly deletedAt: Date,
  ) {}
}
