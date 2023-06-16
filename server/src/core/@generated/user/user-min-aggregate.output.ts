import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class UserMinAggregate {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  lastSeen?: Date | string;

  @Field(() => Boolean, { nullable: true })
  disabled?: boolean;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  locale?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @HideField()
  passwordHash?: string;

  @Field(() => Boolean, { nullable: true })
  emailVerified?: boolean;
}
