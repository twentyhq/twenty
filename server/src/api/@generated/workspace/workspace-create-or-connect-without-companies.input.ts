import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutCompaniesInput } from './workspace-create-without-companies.input';

@InputType()
export class WorkspaceCreateOrConnectWithoutCompaniesInput {

    @Field(() => WorkspaceWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceWhereUniqueInput)
    where!: WorkspaceWhereUniqueInput;

    @Field(() => WorkspaceCreateWithoutCompaniesInput, {nullable:false})
    @Type(() => WorkspaceCreateWithoutCompaniesInput)
    create!: WorkspaceCreateWithoutCompaniesInput;
}
