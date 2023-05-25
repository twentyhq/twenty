import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateOrConnectWithoutCompaniesInput } from './WorkspaceCreateOrConnectWithoutCompaniesInput';
import { WorkspaceCreateWithoutCompaniesInput } from './WorkspaceCreateWithoutCompaniesInput';
import { WorkspaceWhereUniqueInput } from './WorkspaceWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceCreateNestedOneWithoutCompaniesInput', {
  isAbstract: true,
})
export class WorkspaceCreateNestedOneWithoutCompaniesInput {
  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutCompaniesInput, {
    nullable: true,
  })
  create?: WorkspaceCreateWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceCreateOrConnectWithoutCompaniesInput, {
    nullable: true,
  })
  connectOrCreate?: WorkspaceCreateOrConnectWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: true,
  })
  connect?: WorkspaceWhereUniqueInput | undefined;
}
