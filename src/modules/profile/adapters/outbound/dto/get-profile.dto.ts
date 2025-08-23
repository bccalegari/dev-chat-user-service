import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetProfileDto {
  @Field()
  readonly id: string;

  @Field()
  readonly username: string;

  @Field()
  readonly birthDate: string;

  @Field({ nullable: true })
  readonly bio?: string;

  @Field({ nullable: true })
  readonly avatarUrl?: string;

  @Field()
  readonly userId: string;

  @Field()
  readonly createdAt: string;

  @Field({ nullable: true })
  readonly updatedAt?: string;

  @Field({ nullable: true })
  readonly deletedAt?: string;
}
