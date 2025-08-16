import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProfileDto {
  @Field()
  readonly userId: string;

  @Field({ nullable: true })
  readonly bio?: string;

  @Field({ nullable: true })
  readonly avatarUrl?: string;
}
