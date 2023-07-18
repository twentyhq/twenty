import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyCreateWithoutAccountOwnerInput } from './company-create-without-account-owner.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CompanyCreateOrConnectWithoutAccountOwnerInput {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @HideField()
    create!: CompanyCreateWithoutAccountOwnerInput;
}
