export class UserCreatedEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly name: string,
    readonly lastName: string,
    readonly createdAt: Date,
  ) {}
}
