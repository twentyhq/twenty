import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyCreateInput } from './company-create.input';
import { CompanyUpdateInput } from './company-update.input';

@ArgsType()
export class UpsertOneCompanyArgs {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @Field(() => CompanyCreateInput, {nullable:false})
    @Type(() => CompanyCreateInput)
    create!: CompanyCreateInput;

    @Field(() => CompanyUpdateInput, {nullable:false})
    @Type(() => CompanyUpdateInput)
    update!: CompanyUpdateInput;
}
