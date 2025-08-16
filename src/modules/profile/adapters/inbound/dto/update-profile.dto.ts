import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProfileDto {
  @Field()
  readonly id: string;

  @Field({ nullable: true })
  readonly bio?: string;

  @Field({ nullable: true })
  readonly avatarUrl?: string;
}
