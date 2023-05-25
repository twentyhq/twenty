import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberUpdateWithoutWorkspaceInput } from './WorkspaceMemberUpdateWithoutWorkspaceInput';
import { WorkspaceMemberWhereUniqueInput } from './WorkspaceMemberWhereUniqueInput';

@TypeGraphQL.InputType(
  'WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput',
  {
    isAbstract: true,
  },
)
export class WorkspaceMemberUpdateWithWhereUniqueWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => WorkspaceMemberWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceMemberWhereUniqueInput;

  @TypeGraphQL.Field((_type) => WorkspaceMemberUpdateWithoutWorkspaceInput, {
    nullable: false,
  })
  data!: WorkspaceMemberUpdateWithoutWorkspaceInput;
}
