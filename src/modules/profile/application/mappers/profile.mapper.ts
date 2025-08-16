import { Profile } from '@modules/profile/domain/entities/profile';
import { CreateProfileDto } from '@modules/profile/adapters/inbound/dto/create-profile.dto';
import { GetProfileDto } from '@modules/profile/adapters/outbound/dto/get-profile.dto';

export class ProfileMapper {
  static fromNeo4j(props: {
    id: string;
    bio?: string;
    avatar_url?: string;
    user_id: string;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
  }): Profile {
    return Profile.from({
      id: props.id,
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
      bio: dto.bio,
      avatarUrl: dto.avatarUrl,
    });
  }

  static toGetProfileDto(profile: Profile) {
    return {
      id: profile.id,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      userId: profile.userId,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt?.toISOString(),
      deletedAt: profile.deletedAt?.toISOString(),
    } as GetProfileDto;
  }
}
