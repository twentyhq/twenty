import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { BoolFilter } from '../prisma/bool-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { UserRelationFilter } from '../user/user-relation-filter.input';

@InputType()
export class RefreshTokenWhereInput {
  @Field(() => [RefreshTokenWhereInput], { nullable: true })
  AND?: Array<RefreshTokenWhereInput>;

  @Field(() => [RefreshTokenWhereInput], { nullable: true })
  OR?: Array<RefreshTokenWhereInput>;

  @Field(() => [RefreshTokenWhereInput], { nullable: true })
  NOT?: Array<RefreshTokenWhereInput>;

  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  createdAt?: DateTimeFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  updatedAt?: DateTimeFilter;

  @Field(() => BoolFilter, { nullable: true })
  isRevoked?: BoolFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  expiresAt?: DateTimeFilter;

  @Field(() => DateTimeNullableFilter, { nullable: true })
  deletedAt?: DateTimeNullableFilter;

  @HideField()
  userId?: StringFilter;

  @HideField()
  user?: UserRelationFilter;
}
