import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyCreateWithoutAccountOwnerInput } from './company-create-without-account-owner.input';

@InputType()
export class CompanyCreateOrConnectWithoutAccountOwnerInput {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @Field(() => CompanyCreateWithoutAccountOwnerInput, {nullable:false})
    @Type(() => CompanyCreateWithoutAccountOwnerInput)
    create!: CompanyCreateWithoutAccountOwnerInput;
}
