import { randomUUID } from 'crypto';

export class Profile {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly createdAt: Date,
    private _bio?: string,
    private _avatarUrl?: string,
    private _updatedAt?: Date,
    private _deletedAt?: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this._bio = _bio;
    this._avatarUrl = _avatarUrl;
    this._updatedAt = _updatedAt;
    this.validate();
  }

  static create(props: {
    userId: string;
    bio?: string;
    avatarUrl?: string;
  }): Profile {
    return new Profile(
      randomUUID(),
      props.userId,
      new Date(),
      props.bio,
      props.avatarUrl,
    );
  }

  static from(props: {
    id: string;
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
      props.bio,
      props.avatarUrl,
      props.updatedAt,
    );
  }

  update(props: { bio?: string; avatarUrl?: string }): void {
    if (props.bio !== undefined) {
      this._bio = props.bio;
    }
    if (props.avatarUrl !== undefined) {
      this._avatarUrl = props.avatarUrl;
    }
    this._updatedAt = new Date();
    this.validate();
  }

  delete(): void {
    this._deletedAt = new Date();
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
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
    if (this._updatedAt && this._updatedAt < this.createdAt) {
      throw new Error('Updated date cannot be earlier than created date');
    }
    if (this._bio && this._bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters');
    }
    if (
      this._avatarUrl &&
      !/^http?:\/\/.+\.(jpg|jpeg|png)$/.test(this._avatarUrl)
    ) {
      throw new Error('Avatar URL must be a valid image URL');
    }
  }
}
