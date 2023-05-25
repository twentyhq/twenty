import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateWithoutCompaniesInput } from './WorkspaceCreateWithoutCompaniesInput';
import { WorkspaceWhereUniqueInput } from './WorkspaceWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceCreateOrConnectWithoutCompaniesInput', {
  isAbstract: true,
})
export class WorkspaceCreateOrConnectWithoutCompaniesInput {
  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceWhereUniqueInput;

  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutCompaniesInput, {
    nullable: false,
  })
  create!: WorkspaceCreateWithoutCompaniesInput;
}
