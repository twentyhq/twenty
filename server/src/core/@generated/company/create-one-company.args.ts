import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyCreateInput } from './company-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneCompanyArgs {

    @Field(() => CompanyCreateInput, {nullable:false})
    @Type(() => CompanyCreateInput)
    @Type(() => CompanyCreateInput)
    @ValidateNested({each: true})
    data!: CompanyCreateInput;
}
