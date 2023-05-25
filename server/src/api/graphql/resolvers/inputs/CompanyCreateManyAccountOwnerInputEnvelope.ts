import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateManyAccountOwnerInput } from '../inputs/CompanyCreateManyAccountOwnerInput';

@TypeGraphQL.InputType('CompanyCreateManyAccountOwnerInputEnvelope', {
  isAbstract: true,
})
export class CompanyCreateManyAccountOwnerInputEnvelope {
  @TypeGraphQL.Field((_type) => [CompanyCreateManyAccountOwnerInput], {
    nullable: false,
  })
  data!: CompanyCreateManyAccountOwnerInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
