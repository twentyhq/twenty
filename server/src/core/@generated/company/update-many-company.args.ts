import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CompanyUpdateManyMutationInput } from './company-update-many-mutation.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CompanyWhereInput } from './company-where.input';

@ArgsType()
export class UpdateManyCompanyArgs {

    @Field(() => CompanyUpdateManyMutationInput, {nullable:false})
    @Type(() => CompanyUpdateManyMutationInput)
    @Type(() => CompanyUpdateManyMutationInput)
    @ValidateNested({each: true})
    data!: CompanyUpdateManyMutationInput;

    @Field(() => CompanyWhereInput, {nullable:true})
    @Type(() => CompanyWhereInput)
    where?: CompanyWhereInput;
}
