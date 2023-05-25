import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateOrConnectWithoutCompaniesInput } from './UserCreateOrConnectWithoutCompaniesInput';
import { UserCreateWithoutCompaniesInput } from './UserCreateWithoutCompaniesInput';
import { UserUpdateWithoutCompaniesInput } from './UserUpdateWithoutCompaniesInput';
import { UserUpsertWithoutCompaniesInput } from './UserUpsertWithoutCompaniesInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType('UserUpdateOneWithoutCompaniesNestedInput', {
  isAbstract: true,
})
export class UserUpdateOneWithoutCompaniesNestedInput {
  @TypeGraphQL.Field((_type) => UserCreateWithoutCompaniesInput, {
    nullable: true,
  })
  create?: UserCreateWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field((_type) => UserCreateOrConnectWithoutCompaniesInput, {
    nullable: true,
  })
  connectOrCreate?: UserCreateOrConnectWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field((_type) => UserUpsertWithoutCompaniesInput, {
    nullable: true,
  })
  upsert?: UserUpsertWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: true,
  })
  connect?: UserWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => UserUpdateWithoutCompaniesInput, {
    nullable: true,
  })
  update?: UserUpdateWithoutCompaniesInput | undefined;
}
