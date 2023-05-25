import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PersonWhereUniqueInput } from '../../../inputs/PersonWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniquePersonOrThrowArgs {
  @TypeGraphQL.Field((_type) => PersonWhereUniqueInput, {
    nullable: false,
  })
  where!: PersonWhereUniqueInput;
}
