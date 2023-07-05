import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyUpdateInput } from './company-update.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CompanyWhereUniqueInput } from './company-where-unique.input';

@ArgsType()
export class UpdateOneCompanyArgs {

    @Field(() => CompanyUpdateInput, {nullable:false})
    @Type(() => CompanyUpdateInput)
    @Type(() => CompanyUpdateInput)
    @ValidateNested({each: true})
    data!: CompanyUpdateInput;

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;
}
