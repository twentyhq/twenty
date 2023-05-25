import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateWithoutPeopleInput } from './WorkspaceCreateWithoutPeopleInput';
import { WorkspaceWhereUniqueInput } from './WorkspaceWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceCreateOrConnectWithoutPeopleInput', {
  isAbstract: true,
})
export class WorkspaceCreateOrConnectWithoutPeopleInput {
  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceWhereUniqueInput;

  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutPeopleInput, {
    nullable: false,
  })
  create!: WorkspaceCreateWithoutPeopleInput;
}
