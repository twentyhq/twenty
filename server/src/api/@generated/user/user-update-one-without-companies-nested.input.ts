import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCompaniesInput } from './user-create-without-companies.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutCompaniesInput } from './user-create-or-connect-without-companies.input';
import { UserUpsertWithoutCompaniesInput } from './user-upsert-without-companies.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutCompaniesInput } from './user-update-without-companies.input';

@InputType()
export class UserUpdateOneWithoutCompaniesNestedInput {

    @Field(() => UserCreateWithoutCompaniesInput, {nullable:true})
    @Type(() => UserCreateWithoutCompaniesInput)
    create?: UserCreateWithoutCompaniesInput;

    @Field(() => UserCreateOrConnectWithoutCompaniesInput, {nullable:true})
    @Type(() => UserCreateOrConnectWithoutCompaniesInput)
    connectOrCreate?: UserCreateOrConnectWithoutCompaniesInput;

    @Field(() => UserUpsertWithoutCompaniesInput, {nullable:true})
    @Type(() => UserUpsertWithoutCompaniesInput)
    upsert?: UserUpsertWithoutCompaniesInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @Field(() => Boolean, {nullable:true})
    delete?: boolean;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @Field(() => UserUpdateWithoutCompaniesInput, {nullable:true})
    @Type(() => UserUpdateWithoutCompaniesInput)
    update?: UserUpdateWithoutCompaniesInput;
}
