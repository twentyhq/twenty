import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { WorkspaceMemberCreateManyInput } from '../../../inputs/WorkspaceMemberCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyWorkspaceMemberArgs {
  @TypeGraphQL.Field((_type) => [WorkspaceMemberCreateManyInput], {
    nullable: false,
  })
  data!: WorkspaceMemberCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
