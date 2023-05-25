import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.ObjectType('PersonMinAggregate', {
  isAbstract: true,
})
export class PersonMinAggregate {
  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  id!: string | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt!: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deletedAt!: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  firstname!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  lastname!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  email!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  phone!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  city!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  companyId!: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  workspaceId!: string | null;
}
