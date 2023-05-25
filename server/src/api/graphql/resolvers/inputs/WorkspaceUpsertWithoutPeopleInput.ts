import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateWithoutPeopleInput } from '../inputs/WorkspaceCreateWithoutPeopleInput';
import { WorkspaceUpdateWithoutPeopleInput } from '../inputs/WorkspaceUpdateWithoutPeopleInput';

@TypeGraphQL.InputType('WorkspaceUpsertWithoutPeopleInput', {
  isAbstract: true,
})
export class WorkspaceUpsertWithoutPeopleInput {
  @TypeGraphQL.Field((_type) => WorkspaceUpdateWithoutPeopleInput, {
    nullable: false,
  })
  update!: WorkspaceUpdateWithoutPeopleInput;

  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutPeopleInput, {
    nullable: false,
  })
  create!: WorkspaceCreateWithoutPeopleInput;
}
