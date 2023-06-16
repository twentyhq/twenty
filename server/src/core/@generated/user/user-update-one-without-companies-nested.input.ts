import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCompaniesInput } from './user-create-without-companies.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutCompaniesInput } from './user-create-or-connect-without-companies.input';
import { UserUpsertWithoutCompaniesInput } from './user-upsert-without-companies.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserUpdateWithoutCompaniesInput } from './user-update-without-companies.input';

@InputType()
export class UserUpdateOneWithoutCompaniesNestedInput {

    @HideField()
    create?: UserCreateWithoutCompaniesInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutCompaniesInput;

    @HideField()
    upsert?: UserUpsertWithoutCompaniesInput;

    @HideField()
    disconnect?: boolean;

    @HideField()
    delete?: boolean;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @HideField()
    update?: UserUpdateWithoutCompaniesInput;
}
