import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { WorkspaceWhereInput } from '../../../inputs/WorkspaceWhereInput';

@TypeGraphQL.ArgsType()
export class DeleteManyWorkspaceArgs {
  @TypeGraphQL.Field((_type) => WorkspaceWhereInput, {
    nullable: true,
  })
  where?: WorkspaceWhereInput | undefined;
}
