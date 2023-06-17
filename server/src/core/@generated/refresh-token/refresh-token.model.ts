import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { User } from '../user/user.model';

@ObjectType()
export class RefreshToken {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isRevoked!: boolean;

  @Field(() => Date, { nullable: false })
  expiresAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @HideField()
  userId!: string;

  @HideField()
  user?: User;
}
