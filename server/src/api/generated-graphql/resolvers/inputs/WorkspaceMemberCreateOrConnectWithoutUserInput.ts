import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateWithoutUserInput } from './WorkspaceMemberCreateWithoutUserInput';
import { WorkspaceMemberWhereUniqueInput } from './WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceMemberCreateOrConnectWithoutUserInput', {
  isAbstract: true,
})
export class WorkspaceMemberCreateOrConnectWithoutUserInput {
  @TypeGraphQL.Field((_type) => WorkspaceMemberWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceMemberWhereUniqueInput;

  @TypeGraphQL.Field((_type) => WorkspaceMemberCreateWithoutUserInput, {
    nullable: false,
  })
  create!: WorkspaceMemberCreateWithoutUserInput;
}
