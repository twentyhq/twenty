import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PersonScalarWhereInput {
  @Field(() => [PersonScalarWhereInput], { nullable: true })
  AND?: Array<PersonScalarWhereInput>;

  @Field(() => [PersonScalarWhereInput], { nullable: true })
  OR?: Array<PersonScalarWhereInput>;

  @Field(() => [PersonScalarWhereInput], { nullable: true })
  NOT?: Array<PersonScalarWhereInput>;

  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  createdAt?: DateTimeFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  updatedAt?: DateTimeFilter;

  @Field(() => DateTimeNullableFilter, { nullable: true })
  deletedAt?: DateTimeNullableFilter;

  @Field(() => StringFilter, { nullable: true })
  firstname?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  lastname?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  email?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  phone?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  city?: StringFilter;

  @Field(() => StringNullableFilter, { nullable: true })
  companyId?: StringNullableFilter;

  @HideField()
  workspaceId?: StringFilter;
}
