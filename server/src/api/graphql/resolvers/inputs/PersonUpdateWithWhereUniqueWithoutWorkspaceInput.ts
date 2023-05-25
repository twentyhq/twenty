import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonUpdateWithoutWorkspaceInput } from '../inputs/PersonUpdateWithoutWorkspaceInput';
import { PersonWhereUniqueInput } from '../inputs/PersonWhereUniqueInput';

@TypeGraphQL.InputType('PersonUpdateWithWhereUniqueWithoutWorkspaceInput', {
  isAbstract: true,
})
export class PersonUpdateWithWhereUniqueWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => PersonWhereUniqueInput, {
    nullable: false,
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field((_type) => PersonUpdateWithoutWorkspaceInput, {
    nullable: false,
  })
  data!: PersonUpdateWithoutWorkspaceInput;
}
