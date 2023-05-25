import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceMemberCreateWithoutUserInput } from '../inputs/WorkspaceMemberCreateWithoutUserInput';
import { WorkspaceMemberUpdateWithoutUserInput } from '../inputs/WorkspaceMemberUpdateWithoutUserInput';

@TypeGraphQL.InputType('WorkspaceMemberUpsertWithoutUserInput', {
  isAbstract: true,
})
export class WorkspaceMemberUpsertWithoutUserInput {
  @TypeGraphQL.Field((_type) => WorkspaceMemberUpdateWithoutUserInput, {
    nullable: false,
  })
  update!: WorkspaceMemberUpdateWithoutUserInput;

  @TypeGraphQL.Field((_type) => WorkspaceMemberCreateWithoutUserInput, {
    nullable: false,
  })
  create!: WorkspaceMemberCreateWithoutUserInput;
}
