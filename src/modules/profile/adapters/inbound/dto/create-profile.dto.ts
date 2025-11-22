import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProfileDto {
  @Field()
  readonly userId: string;

  @Field()
  readonly username: string;

  @Field()
  readonly birthDate: string;

  @Field({ nullable: true })
  readonly bio?: string;
}
