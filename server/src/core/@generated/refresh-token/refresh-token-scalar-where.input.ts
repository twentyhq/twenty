import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { BoolFilter } from '../prisma/bool-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class RefreshTokenScalarWhereInput {
  @Field(() => [RefreshTokenScalarWhereInput], { nullable: true })
  AND?: Array<RefreshTokenScalarWhereInput>;

  @Field(() => [RefreshTokenScalarWhereInput], { nullable: true })
  OR?: Array<RefreshTokenScalarWhereInput>;

  @Field(() => [RefreshTokenScalarWhereInput], { nullable: true })
  NOT?: Array<RefreshTokenScalarWhereInput>;

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
}
