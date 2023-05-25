import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { PersonCreateManyInput } from '../../../inputs/PersonCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyPersonArgs {
  @TypeGraphQL.Field((_type) => [PersonCreateManyInput], {
    nullable: false,
  })
  data!: PersonCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
