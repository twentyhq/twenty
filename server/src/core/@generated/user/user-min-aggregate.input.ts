import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class UserMinAggregateInput {
  @Field(() => Boolean, { nullable: true })
  id?: true;

  @Field(() => Boolean, { nullable: true })
  createdAt?: true;

  @Field(() => Boolean, { nullable: true })
  updatedAt?: true;

  @Field(() => Boolean, { nullable: true })
  deletedAt?: true;

  @Field(() => Boolean, { nullable: true })
  lastSeen?: true;

  @Field(() => Boolean, { nullable: true })
  disabled?: true;

  @Field(() => Boolean, { nullable: true })
  displayName?: true;

  @Field(() => Boolean, { nullable: true })
  email?: true;

  @Field(() => Boolean, { nullable: true })
  avatarUrl?: true;

  @Field(() => Boolean, { nullable: true })
  locale?: true;

  @Field(() => Boolean, { nullable: true })
  phoneNumber?: true;

  @Field(() => Boolean, { nullable: true })
  passwordHash?: true;

  @Field(() => Boolean, { nullable: true })
  emailVerified?: true;
}
