import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from './DateTimeFilter';
import { DateTimeNullableFilter } from './DateTimeNullableFilter';
import { StringFilter } from './StringFilter';

@TypeGraphQL.InputType('RefreshTokenScalarWhereInput', {
  isAbstract: true,
})
export class RefreshTokenScalarWhereInput {
  @TypeGraphQL.Field((_type) => [RefreshTokenScalarWhereInput], {
    nullable: true,
  })
  AND?: RefreshTokenScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenScalarWhereInput], {
    nullable: true,
  })
  OR?: RefreshTokenScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [RefreshTokenScalarWhereInput], {
    nullable: true,
  })
  NOT?: RefreshTokenScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  id?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  createdAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFilter, {
    nullable: true,
  })
  updatedAt?: DateTimeFilter | undefined;

  @TypeGraphQL.Field((_type) => DateTimeNullableFilter, {
    nullable: true,
  })
  deletedAt?: DateTimeNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  refreshToken?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  userId?: StringFilter | undefined;
}
