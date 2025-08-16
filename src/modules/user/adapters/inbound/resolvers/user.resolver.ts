import { Args, Resolver, Query, Info } from '@nestjs/graphql';
import { GetUserDto } from '@modules/user/adapters/outbound/dto/get-user-dto';
import { Logger } from '@nestjs/common';
import { GetUserByIdUseCase } from '@modules/user/application/usecases/get-user-by-id.usecase';
import { GraphQLResolveInfo } from 'graphql/type';

@Resolver(() => GetUserDto)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);

  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  @Query(() => GetUserDto, { description: 'Get user by id', nullable: true })
  async getUser(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<GetUserDto | null> {
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
