import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutCompaniesInput } from './workspace-update-without-companies.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutCompaniesInput } from './workspace-create-without-companies.input';

@InputType()
export class WorkspaceUpsertWithoutCompaniesInput {

    @Field(() => WorkspaceUpdateWithoutCompaniesInput, {nullable:false})
    @Type(() => WorkspaceUpdateWithoutCompaniesInput)
    update!: WorkspaceUpdateWithoutCompaniesInput;

    @Field(() => WorkspaceCreateWithoutCompaniesInput, {nullable:false})
    @Type(() => WorkspaceCreateWithoutCompaniesInput)
    create!: WorkspaceCreateWithoutCompaniesInput;
}
