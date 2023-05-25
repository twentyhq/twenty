import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { WorkspaceWhereUniqueInput } from '../../../inputs/WorkspaceWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueWorkspaceArgs {
  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: false,
  })
  where!: WorkspaceWhereUniqueInput;
}
