import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyUpdateWithoutAccountOwnerInput } from './company-update-without-account-owner.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateWithoutAccountOwnerInput } from './company-create-without-account-owner.input';

@InputType()
export class CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @HideField()
    update!: CompanyUpdateWithoutAccountOwnerInput;

    @HideField()
    create!: CompanyCreateWithoutAccountOwnerInput;
}
