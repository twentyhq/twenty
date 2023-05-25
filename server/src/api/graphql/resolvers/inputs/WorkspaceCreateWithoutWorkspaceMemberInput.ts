import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateNestedManyWithoutWorkspaceInput } from '../inputs/CompanyCreateNestedManyWithoutWorkspaceInput';
import { PersonCreateNestedManyWithoutWorkspaceInput } from '../inputs/PersonCreateNestedManyWithoutWorkspaceInput';

@TypeGraphQL.InputType('WorkspaceCreateWithoutWorkspaceMemberInput', {
  isAbstract: true,
})
export class WorkspaceCreateWithoutWorkspaceMemberInput {
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
  domainName!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  displayName!: string;

  @TypeGraphQL.Field((_type) => CompanyCreateNestedManyWithoutWorkspaceInput, {
    nullable: true,
  })
  companies?: CompanyCreateNestedManyWithoutWorkspaceInput | undefined;

  @TypeGraphQL.Field((_type) => PersonCreateNestedManyWithoutWorkspaceInput, {
    nullable: true,
  })
  people?: PersonCreateNestedManyWithoutWorkspaceInput | undefined;
}
