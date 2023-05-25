import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateNestedOneWithoutPeopleInput } from './CompanyCreateNestedOneWithoutPeopleInput';
import { WorkspaceCreateNestedOneWithoutPeopleInput } from './WorkspaceCreateNestedOneWithoutPeopleInput';

@TypeGraphQL.InputType('PersonCreateInput', {
  isAbstract: true,
})
export class PersonCreateInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deletedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  firstname!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  lastname!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  email!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  phone!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  city!: string;

  @TypeGraphQL.Field((_type) => CompanyCreateNestedOneWithoutPeopleInput, {
    nullable: true,
  })
  company?: CompanyCreateNestedOneWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceCreateNestedOneWithoutPeopleInput, {
    nullable: false,
  })
  workspace!: WorkspaceCreateNestedOneWithoutPeopleInput;
}
