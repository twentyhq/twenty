import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Person } from './Person';
import { User } from './User';
import { Workspace } from './Workspace';
import { CompanyCount } from '../resolvers/outputs/CompanyCount';

@TypeGraphQL.ObjectType('Company', {
  isAbstract: true,
})
export class Company {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deletedAt?: Date | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  name!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  domainName!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  address!: string;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  employees?: number | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  accountOwnerId?: string | null;

  accountOwner?: User | null;

  people?: Person[];

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  workspaceId!: string;

  workspace?: Workspace;

  @TypeGraphQL.Field((_type) => CompanyCount, {
    nullable: true,
  })
  _count?: CompanyCount | null;
}
