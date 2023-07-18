import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutPeopleInput } from './company-create-without-people.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateOrConnectWithoutPeopleInput } from './company-create-or-connect-without-people.input';
import { CompanyUpsertWithoutPeopleInput } from './company-upsert-without-people.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyUpdateWithoutPeopleInput } from './company-update-without-people.input';

@InputType()
export class CompanyUpdateOneWithoutPeopleNestedInput {

    @HideField()
    create?: CompanyCreateWithoutPeopleInput;

    @HideField()
    connectOrCreate?: CompanyCreateOrConnectWithoutPeopleInput;

    @HideField()
    upsert?: CompanyUpsertWithoutPeopleInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @HideField()
    delete?: boolean;

    @Field(() => CompanyWhereUniqueInput, {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: CompanyWhereUniqueInput;

    @HideField()
    update?: CompanyUpdateWithoutPeopleInput;
}
