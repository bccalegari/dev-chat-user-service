import { Email } from '@modules/user/domain/value-objects/email';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';
import { randomUUID } from 'crypto';
import { UserUpdatedEvent } from '@modules/user/domain/events/user-updated.event';

export class User {
  private constructor(
    readonly id: string,
    readonly keycloakId: string,
    private _username: string,
    private _email: Email,
    private _name: string,
    private _lastName: string,
    readonly createdAt: Date,
    private _updatedAt?: Date,
  ) {
    this.validate();
  }

  static create(event: UserCreatedEvent): User {
    return new User(
      randomUUID(),
      event.keycloakId,
      event.username,
      new Email(event.email),
      event.name,
      event.lastName,
      new Date(Number(event.createdAt)),
    );
  }

  update(event: UserUpdatedEvent): void {
    if (event.username && event.username !== this._username) {
      this._username = event.username;
    }

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

  static from(props: {
    id: string;
    keycloakId: string;
    username: string;
    email: string;
    name: string;
    lastName: string;
    createdAt: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      props.id,
      props.keycloakId,
      props.username,
      new Email(props.email),
      props.name,
      props.lastName,
      props.createdAt,
      props.updatedAt,
    );
  }

  get username(): string {
    return this._username;
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

  private validate(): void {
    if (!this.id.trim()) throw new Error('User ID is required');
    if (!this.keycloakId.trim()) throw new Error('Keycloak ID is required');
    if (!this._email) throw new Error('Email is required');
    if (!this._username.trim()) throw new Error('Username is required');
    if (!this._name.trim()) throw new Error('Name is required');
    if (!this._lastName.trim()) throw new Error('Last name is required');
    if (this._updatedAt && this._updatedAt < this.createdAt)
      throw new Error('Updated date cannot be earlier than created date');
  }
}
