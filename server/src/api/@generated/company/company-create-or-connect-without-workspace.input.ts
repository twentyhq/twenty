import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyCreateWithoutWorkspaceInput } from './company-create-without-workspace.input';

@InputType()
export class CompanyCreateOrConnectWithoutWorkspaceInput {

    @Field(() => CompanyWhereUniqueInput, {nullable:false})
    @Type(() => CompanyWhereUniqueInput)
    where!: CompanyWhereUniqueInput;

    @Field(() => CompanyCreateWithoutWorkspaceInput, {nullable:false})
    @Type(() => CompanyCreateWithoutWorkspaceInput)
    create!: CompanyCreateWithoutWorkspaceInput;
}
