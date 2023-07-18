import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCompaniesInput } from './workspace-create-without-companies.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutCompaniesInput } from './workspace-create-or-connect-without-companies.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceCreateNestedOneWithoutCompaniesInput {

    @HideField()
    create?: WorkspaceCreateWithoutCompaniesInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutCompaniesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
