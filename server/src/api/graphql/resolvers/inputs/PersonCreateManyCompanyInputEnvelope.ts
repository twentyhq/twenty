import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PersonCreateManyCompanyInput } from '../inputs/PersonCreateManyCompanyInput';

@TypeGraphQL.InputType('PersonCreateManyCompanyInputEnvelope', {
  isAbstract: true,
})
export class PersonCreateManyCompanyInputEnvelope {
  @TypeGraphQL.Field((_type) => [PersonCreateManyCompanyInput], {
    nullable: false,
  })
  data!: PersonCreateManyCompanyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
