import { Email } from '@modules/user/domain/value-objects/email';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';
import { UserUpdatedEvent } from '@modules/user/domain/events/user-updated.event';

export class User {
  private constructor(
    readonly id: string,
    private _email: Email,
    private _name: string,
    private _lastName: string,
    readonly createdAt: Date,
    private _updatedAt?: Date,
    private _deletedAt?: Date,
  ) {
    this.validate();
  }

  static create(event: UserCreatedEvent): User {
    return new User(
      event.userId,
      new Email(event.email),
      event.name,
      event.lastName,
      new Date(Number(event.createdAt)),
    );
  }

  update(event: UserUpdatedEvent): void {
    if (event.email && event.email !== this._email.value) {
      this._email = new Email(event.email);
    }

    if (event.name && event.name !== this._name) {
      this._name = event.name;
    }

    if (event.lastName && event.lastName !== this._lastName) {
      this._lastName = event.lastName;
    }

    this._updatedAt = event.updatedAt;

    this.validate();
  }

  delete(deletedAt: Date): void {
    if (!deletedAt || deletedAt < this.createdAt) {
      throw new Error(
        'Deleted date must be provided and cannot be earlier than created date',
      );
    }
    this._deletedAt = deletedAt;
  }

  static from(props: {
    id: string;
    email: string;
    name: string;
    lastName: string;
    createdAt: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      props.id,
      new Email(props.email),
      props.name,
      props.lastName,
      props.createdAt,
      props.updatedAt,
    );
  }

  get email(): string {
    return this._email.value;
  }

  get name(): string {
    return this._name;
  }

  get lastName(): string {
    return this._lastName;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  get fullName(): string {
    return `${this._name} ${this._lastName}`;
  }

  private validate(): void {
    if (!this.id.trim()) throw new Error('User ID is required');
    if (!this._email) throw new Error('Email is required');
    if (!this._name.trim()) throw new Error('Name is required');
    if (!this._lastName.trim()) throw new Error('Last name is required');
    if (this._updatedAt && this._updatedAt < this.createdAt)
      throw new Error('Updated date cannot be earlier than created date');
  }
}
