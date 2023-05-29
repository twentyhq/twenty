import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCompaniesInput } from './user-create-without-companies.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutCompaniesInput } from './user-create-or-connect-without-companies.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutCompaniesInput {
  @Field(() => UserCreateWithoutCompaniesInput, { nullable: true })
  @Type(() => UserCreateWithoutCompaniesInput)
  create?: UserCreateWithoutCompaniesInput;

  @Field(() => UserCreateOrConnectWithoutCompaniesInput, { nullable: true })
  @Type(() => UserCreateOrConnectWithoutCompaniesInput)
  connectOrCreate?: UserCreateOrConnectWithoutCompaniesInput;

  @Field(() => UserWhereUniqueInput, { nullable: true })
  @Type(() => UserWhereUniqueInput)
  connect?: UserWhereUniqueInput;
}
