import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberScalarWhereInput } from './WorkspaceMemberScalarWhereInput';
import { WorkspaceMemberUpdateManyMutationInput } from './WorkspaceMemberUpdateManyMutationInput';

@TypeGraphQL.InputType(
  'WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput',
  {
    isAbstract: true,
  },
)
export class WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => WorkspaceMemberScalarWhereInput, {
    nullable: false,
  })
  where!: WorkspaceMemberScalarWhereInput;

  @TypeGraphQL.Field((_type) => WorkspaceMemberUpdateManyMutationInput, {
    nullable: false,
  })
  data!: WorkspaceMemberUpdateManyMutationInput;
}
