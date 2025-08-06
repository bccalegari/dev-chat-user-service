import { Args, Resolver, Query, Info } from '@nestjs/graphql';
import { UserDto } from '@modules/user/adapters/outbound/dto/user.dto';
import { Logger } from '@nestjs/common';
import { GetUserByIdUseCase } from '@modules/user/application/usecases/get-user-by-id.usecase';
import { GraphQLResolveInfo } from 'graphql/type';

@Resolver(() => UserDto)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  @Query(() => UserDto, { description: 'Get user by id', nullable: true })
  async user(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<UserDto | null> {
    const requestedFields = info.fieldNodes[0].selectionSet?.selections.map(
      (s: any) => s.name.value,
    );
    this.logger.log(
      `Fetching user by id, id=${id}, requestedFields=${JSON.stringify(requestedFields)}`,
    );
    const user = await this.getUserByIdUseCase.execute(id);
    this.logger.log(
      `User fetched successfully, response=${JSON.stringify(user)}`,
    );
    return user;
  }
}
