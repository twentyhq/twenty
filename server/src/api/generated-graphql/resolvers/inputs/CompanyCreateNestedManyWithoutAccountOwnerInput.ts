import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateManyAccountOwnerInputEnvelope } from './CompanyCreateManyAccountOwnerInputEnvelope';
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from './CompanyCreateOrConnectWithoutAccountOwnerInput';
import { CompanyCreateWithoutAccountOwnerInput } from './CompanyCreateWithoutAccountOwnerInput';
import { CompanyWhereUniqueInput } from './CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyCreateNestedManyWithoutAccountOwnerInput', {
  isAbstract: true,
})
export class CompanyCreateNestedManyWithoutAccountOwnerInput {
  @TypeGraphQL.Field((_type) => [CompanyCreateWithoutAccountOwnerInput], {
    nullable: true,
  })
  create?: CompanyCreateWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [CompanyCreateOrConnectWithoutAccountOwnerInput],
    {
      nullable: true,
    },
  )
  connectOrCreate?:
    | CompanyCreateOrConnectWithoutAccountOwnerInput[]
    | undefined;

  @TypeGraphQL.Field((_type) => CompanyCreateManyAccountOwnerInputEnvelope, {
    nullable: true,
  })
  createMany?: CompanyCreateManyAccountOwnerInputEnvelope | undefined;

  @TypeGraphQL.Field((_type) => [CompanyWhereUniqueInput], {
    nullable: true,
  })
  connect?: CompanyWhereUniqueInput[] | undefined;
}
