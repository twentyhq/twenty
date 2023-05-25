import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PersonCreateInput } from '../../../inputs/PersonCreateInput';
import { PersonUpdateInput } from '../../../inputs/PersonUpdateInput';
import { PersonWhereUniqueInput } from '../../../inputs/PersonWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertOnePersonArgs {
  @TypeGraphQL.Field((_type) => PersonWhereUniqueInput, {
    nullable: false,
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field((_type) => PersonCreateInput, {
    nullable: false,
  })
  create!: PersonCreateInput;

  @TypeGraphQL.Field((_type) => PersonUpdateInput, {
    nullable: false,
  })
  update!: PersonUpdateInput;
}
