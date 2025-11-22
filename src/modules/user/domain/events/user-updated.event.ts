export class UserUpdatedEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly name: string,
    readonly lastName: string,
    readonly updatedAt: Date,
  ) {}
}
