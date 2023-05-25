import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFilter } from '../inputs/DateTimeFilter';
import { DateTimeNullableFilter } from '../inputs/DateTimeNullableFilter';
import { StringFilter } from '../inputs/StringFilter';

@TypeGraphQL.InputType('WorkspaceMemberScalarWhereInput', {
  isAbstract: true,
})
export class WorkspaceMemberScalarWhereInput {
  @TypeGraphQL.Field((_type) => [WorkspaceMemberScalarWhereInput], {
    nullable: true,
  })
  AND?: WorkspaceMemberScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberScalarWhereInput], {
    nullable: true,
  })
  OR?: WorkspaceMemberScalarWhereInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceMemberScalarWhereInput], {
    nullable: true,
  })
  NOT?: WorkspaceMemberScalarWhereInput[] | undefined;

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
  userId?: StringFilter | undefined;

  @TypeGraphQL.Field((_type) => StringFilter, {
    nullable: true,
  })
  workspaceId?: StringFilter | undefined;
}
