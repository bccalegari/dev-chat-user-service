import { Profile } from '@modules/profile/domain/entities/profile';
import { CreateProfileDto } from '@modules/profile/adapters/inbound/dto/create-profile.dto';
import { GetProfileDto } from '@modules/profile/adapters/outbound/dto/get-profile.dto';

export class ProfileMapper {
  static fromNeo4j(props: {
    id: string;
    username: string;
    bio?: string;
    avatar_url?: string;
    birth_date: string;
    user_id: string;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
  }): Profile {
    return Profile.from({
      id: props.id,
      username: props.username,
      birthDate: new Date(props.birth_date),
      bio: props.bio,
      avatarUrl: props.avatar_url,
      userId: props.user_id,
      createdAt: new Date(props.created_at),
      updatedAt: props.updated_at ? new Date(props.updated_at) : undefined,
    });
  }

  static fromCreateProfileDto(dto: CreateProfileDto) {
    return Profile.create({
      userId: dto.userId,
      username: dto.username,
      birthDate: new Date(dto.birthDate),
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
    });
  }

  static toGetProfileDto(profile: Profile) {
    return {
      id: profile.id,
      username: profile.username,
      birthDate: profile.birthDateString,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      userId: profile.userId,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt?.toISOString(),
      deletedAt: profile.deletedAt?.toISOString(),
    } as GetProfileDto;
  }
}
