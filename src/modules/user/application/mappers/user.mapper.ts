import { User } from '@modules/user/domain/entities/user';
import { GetUserDto } from '@modules/user/adapters/outbound/dto/get-user-dto';

export class UserMapper {
  static fromNeo4j(props: {
    id: string;
    keycloak_id: string;
    username: string;
    email: string;
    name: string;
    last_name: string;
    created_at: Date;
    updated_at?: Date;
  }): User {
    return User.from({
      id: props.id,
      keycloakId: props.keycloak_id,
      username: props.username,
      email: props.email,
      name: props.name,
      lastName: props.last_name,
      createdAt: new Date(props.created_at),
      updatedAt: props.updated_at ? new Date(props.updated_at) : undefined,
    });
  }

  static toGetUserDto(user: User): GetUserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.fullName,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }
}
