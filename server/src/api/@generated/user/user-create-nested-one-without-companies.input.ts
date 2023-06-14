import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCompaniesInput } from './user-create-without-companies.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutCompaniesInput } from './user-create-or-connect-without-companies.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserCreateNestedOneWithoutCompaniesInput {

    @HideField()
    create?: UserCreateWithoutCompaniesInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutCompaniesInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
