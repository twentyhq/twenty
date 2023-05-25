import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateOrConnectWithoutPeopleInput } from './WorkspaceCreateOrConnectWithoutPeopleInput';
import { WorkspaceCreateWithoutPeopleInput } from './WorkspaceCreateWithoutPeopleInput';
import { WorkspaceWhereUniqueInput } from './WorkspaceWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceCreateNestedOneWithoutPeopleInput', {
  isAbstract: true,
})
export class WorkspaceCreateNestedOneWithoutPeopleInput {
  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutPeopleInput, {
    nullable: true,
  })
  create?: WorkspaceCreateWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceCreateOrConnectWithoutPeopleInput, {
    nullable: true,
  })
  connectOrCreate?: WorkspaceCreateOrConnectWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: true,
  })
  connect?: WorkspaceWhereUniqueInput | undefined;
}
