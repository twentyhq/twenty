import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { NestedIntNullableFilter } from '../inputs/NestedIntNullableFilter';
import { NestedJsonNullableFilter } from '../inputs/NestedJsonNullableFilter';

@TypeGraphQL.InputType('JsonNullableWithAggregatesFilter', {
  isAbstract: true,
})
export class JsonNullableWithAggregatesFilter {
  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  equals?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => [String], {
    nullable: true,
  })
  path?: string[] | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  string_contains?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  string_starts_with?: string | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  string_ends_with?: string | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  array_contains?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  array_starts_with?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  array_ends_with?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  lt?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  lte?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  gt?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  gte?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  not?: Prisma.InputJsonValue | undefined;

  @TypeGraphQL.Field((_type) => NestedIntNullableFilter, {
    nullable: true,
  })
  _count?: NestedIntNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedJsonNullableFilter, {
    nullable: true,
  })
  _min?: NestedJsonNullableFilter | undefined;

  @TypeGraphQL.Field((_type) => NestedJsonNullableFilter, {
    nullable: true,
  })
  _max?: NestedJsonNullableFilter | undefined;
}
