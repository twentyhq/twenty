import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PersonOrderByWithRelationInput } from '../../../inputs/PersonOrderByWithRelationInput';
import { PersonWhereInput } from '../../../inputs/PersonWhereInput';
import { PersonWhereUniqueInput } from '../../../inputs/PersonWhereUniqueInput';
import { PersonScalarFieldEnum } from '../../../../enums/PersonScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class FindFirstPersonOrThrowArgs {
  @TypeGraphQL.Field((_type) => PersonWhereInput, {
    nullable: true,
  })
  where?: PersonWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [PersonOrderByWithRelationInput], {
    nullable: true,
  })
  orderBy?: PersonOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field((_type) => PersonWhereUniqueInput, {
    nullable: true,
  })
  cursor?: PersonWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;

  @TypeGraphQL.Field((_type) => [PersonScalarFieldEnum], {
    nullable: true,
  })
  distinct?:
    | Array<
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
        | 'firstname'
        | 'lastname'
        | 'email'
        | 'phone'
        | 'city'
        | 'companyId'
        | 'workspaceId'
      >
    | undefined;
}
