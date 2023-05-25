import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateManyWorkspaceInput } from './WorkspaceMemberCreateManyWorkspaceInput';

@TypeGraphQL.InputType('WorkspaceMemberCreateManyWorkspaceInputEnvelope', {
  isAbstract: true,
})
export class WorkspaceMemberCreateManyWorkspaceInputEnvelope {
  @TypeGraphQL.Field((_type) => [WorkspaceMemberCreateManyWorkspaceInput], {
    nullable: false,
  })
  data!: WorkspaceMemberCreateManyWorkspaceInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
