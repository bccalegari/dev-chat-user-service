import { randomUUID } from 'crypto';

export class Profile {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly createdAt: Date,
    private _username: string,
    private _birthDate: Date,
    private _bio?: string,
    private _updatedAt?: Date,
    private _deletedAt?: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this._username = _username;
    this._birthDate = _birthDate;
    this._bio = _bio;
    this._updatedAt = _updatedAt;
    this.validate();
  }

  static create(props: {
    userId: string;
    username: string;
    birthDate: Date;
    bio?: string;
    avatarUrl?: string;
  }): Profile {
    return new Profile(
      randomUUID(),
      props.userId,
      new Date(),
      props.username,
      props.birthDate,
      props.bio,
    );
  }

  static from(props: {
    id: string;
    username: string;
    birthDate: Date;
    bio?: string;
    avatarUrl?: string;
    userId: string;
    createdAt: Date;
    updatedAt?: Date;
  }): Profile {
    return new Profile(
      props.id,
      props.userId,
      props.createdAt,
      props.username,
      props.birthDate,
      props.bio,
      props.updatedAt,
    );
  }

  update(props: {
    username?: string;
    birthDate?: Date;
    bio?: string;
    avatarUrl?: string;
  }): void {
    if (props.username !== undefined) {
      this._username = props.username;
    }
    if (props.birthDate !== undefined) {
      this._birthDate = props.birthDate;
    }
    if (props.bio !== undefined) {
      this._bio = props.bio;
    }
    this._updatedAt = new Date();
    this.validate();
  }

  delete(): void {
    this._deletedAt = new Date();
  }

  get username(): string {
    return this._username;
  }

  get birthDate(): Date {
    return this._birthDate;
  }

  get birthDateString(): string {
    return this._birthDate.toISOString().split('T')[0];
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  private validate(): void {
    if (!this.id.trim()) throw new Error('Profile ID is required');
    if (!this.userId.trim()) throw new Error('User ID is required');
    if (this._username.length < 3 || this._username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }
    if (!this._username.trim()) {
      throw new Error('Username is required');
    }
    if (this._birthDate > new Date()) {
      throw new Error('Birth date cannot be in the future');
    }
    if (this._bio && this._bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters');
    }
    if (this._updatedAt && this._updatedAt < this.createdAt) {
      throw new Error('Updated date cannot be earlier than created date');
    }
  }
}
