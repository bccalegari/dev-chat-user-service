import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetUserDto {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  createdAt: string;

  @Field({ nullable: true })
  updatedAt?: string;
}
