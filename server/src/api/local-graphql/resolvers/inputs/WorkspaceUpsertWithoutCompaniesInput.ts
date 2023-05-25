import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateWithoutCompaniesInput } from './WorkspaceCreateWithoutCompaniesInput';
import { WorkspaceUpdateWithoutCompaniesInput } from './WorkspaceUpdateWithoutCompaniesInput';

@TypeGraphQL.InputType('WorkspaceUpsertWithoutCompaniesInput', {
  isAbstract: true,
})
export class WorkspaceUpsertWithoutCompaniesInput {
  @TypeGraphQL.Field((_type) => WorkspaceUpdateWithoutCompaniesInput, {
    nullable: false,
  })
  update!: WorkspaceUpdateWithoutCompaniesInput;

  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutCompaniesInput, {
    nullable: false,
  })
  create!: WorkspaceCreateWithoutCompaniesInput;
}
