export class UserDeletedEvent {
  constructor(
    readonly userId: string,
    readonly deletedAt: Date,
  ) {}
}
