import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { WorkspaceOrderByWithRelationInput } from '../../../inputs/WorkspaceOrderByWithRelationInput';
import { WorkspaceWhereInput } from '../../../inputs/WorkspaceWhereInput';
import { WorkspaceWhereUniqueInput } from '../../../inputs/WorkspaceWhereUniqueInput';
import { WorkspaceScalarFieldEnum } from '../../../../enums/WorkspaceScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class FindManyWorkspaceArgs {
  @TypeGraphQL.Field((_type) => WorkspaceWhereInput, {
    nullable: true,
  })
  where?: WorkspaceWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceOrderByWithRelationInput], {
    nullable: true,
  })
  orderBy?: WorkspaceOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: true,
  })
  cursor?: WorkspaceWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceScalarFieldEnum], {
    nullable: true,
  })
  distinct?:
    | Array<
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
        | 'domainName'
        | 'displayName'
      >
    | undefined;
}
