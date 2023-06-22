import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteOneCompanyArgs {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;
}
