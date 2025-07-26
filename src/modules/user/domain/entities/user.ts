import { randomUUID } from 'crypto';
import { UserCreatedEvent } from '@modules/user/domain/events/user-created.event';
import { Email } from '@modules/user/domain/value-objects/email';

export class User {
  public readonly id: string;
  public readonly keycloakId: string;
  public readonly username: string;
  public readonly email: Email;
  public readonly name: string;
  public readonly lastName: string;
  public readonly createdAt: Date;

  constructor(
    id: string,
    keycloakId: string,
    username: string,
    email: Email,
    name: string,
    lastName: string,
    createdAt?: Date,
  ) {
    this.validate(id, keycloakId, email, username, name, lastName);
    this.id = id;
    this.keycloakId = keycloakId;
    this.username = username;
    this.email = email;
    this.name = name;
    this.lastName = lastName;
    this.createdAt = createdAt || new Date();
  }

  private validate(
    id: string,
    keycloakId: string,
    email: Email,
    username: string,
    name: string,
    lastName: string,
  ): void {
    if (!id || !id.trim()) throw new Error('User ID is required');
    if (!keycloakId || !keycloakId.trim())
      throw new Error('Keycloak ID is required');
    if (!email) throw new Error('Email is required');
    if (!username || !username.trim()) throw new Error('Username is required');
    if (!name || !name.trim()) throw new Error('Name is required');
    if (!lastName || !lastName.trim()) throw new Error('Last name is required');
  }

  static fromUserCreatedEvent(dto: UserCreatedEvent): User {
    return new User(
      randomUUID(),
      dto.keycloakId,
      dto.username,
      new Email(dto.email),
      dto.name,
      dto.lastName,
    );
  }
}
