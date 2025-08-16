import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@modules/user/domain/repositories/user.repository.interface';
import { UserNotFoundException } from '@modules/user/application/exceptions/user-not-found.exception';
import { GetUserDto } from '@modules/user/adapters/outbound/dto/get-user-dto';
import { UserMapper } from '@modules/user/application/mappers/user.mapper';

@Injectable()
export class GetUserByIdUseCase {
  private logger = new Logger(GetUserByIdUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<GetUserDto | null> {
    try {
      this.logger.log(`Getting user by id, id=${id}`);
      return await this.getUserById(id);
    } catch (error) {
      this.logger.error(
        `Failed to get user by id, id=${id}`,
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  private async getUserById(id: string): Promise<GetUserDto | null> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return UserMapper.toGetUserDto(user);
  }
}
