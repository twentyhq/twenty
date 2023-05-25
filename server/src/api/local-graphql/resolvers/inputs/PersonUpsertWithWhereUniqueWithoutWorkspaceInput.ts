import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonCreateWithoutWorkspaceInput } from './PersonCreateWithoutWorkspaceInput';
import { PersonUpdateWithoutWorkspaceInput } from './PersonUpdateWithoutWorkspaceInput';
import { PersonWhereUniqueInput } from './PersonWhereUniqueInput';

@TypeGraphQL.InputType('PersonUpsertWithWhereUniqueWithoutWorkspaceInput', {
  isAbstract: true,
})
export class PersonUpsertWithWhereUniqueWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => PersonWhereUniqueInput, {
    nullable: false,
  })
  where!: PersonWhereUniqueInput;

  @TypeGraphQL.Field((_type) => PersonUpdateWithoutWorkspaceInput, {
    nullable: false,
  })
  update!: PersonUpdateWithoutWorkspaceInput;

  @TypeGraphQL.Field((_type) => PersonCreateWithoutWorkspaceInput, {
    nullable: false,
  })
  create!: PersonCreateWithoutWorkspaceInput;
}
