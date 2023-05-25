import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RefreshTokenWhereInput } from '../inputs/RefreshTokenWhereInput';

@TypeGraphQL.InputType('RefreshTokenListRelationFilter', {
  isAbstract: true,
})
export class RefreshTokenListRelationFilter {
  @TypeGraphQL.Field((_type) => RefreshTokenWhereInput, {
    nullable: true,
  })
  every?: RefreshTokenWhereInput | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenWhereInput, {
    nullable: true,
  })
  some?: RefreshTokenWhereInput | undefined;

  @TypeGraphQL.Field((_type) => RefreshTokenWhereInput, {
    nullable: true,
  })
  none?: RefreshTokenWhereInput | undefined;
}
