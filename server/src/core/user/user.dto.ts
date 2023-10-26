import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TUserV2 {
  @Field(() => ID, { nullable: false })
  id: number;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String, { nullable: false })
  email: string;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  emailVerified: boolean;
}
