import { User } from '@modules/user/domain/entities/user';
import { UserDto } from '@modules/user/adapters/outbound/dto/user.dto';

export class UserDtoMapper {
  static from(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.fullName,
    };
  }
}
