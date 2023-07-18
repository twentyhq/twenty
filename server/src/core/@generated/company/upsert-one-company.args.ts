import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyCreateInput } from './company-create.input';
import { HideField } from '@nestjs/graphql';
import { CompanyUpdateInput } from './company-update.input';

@ArgsType()
export class UpsertOneCompanyArgs {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @HideField()
    create!: CompanyCreateInput;

    @HideField()
    update!: CompanyUpdateInput;
}
