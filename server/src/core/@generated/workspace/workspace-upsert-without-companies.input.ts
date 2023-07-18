import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutCompaniesInput } from './workspace-update-without-companies.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCompaniesInput } from './workspace-create-without-companies.input';

@InputType()
export class WorkspaceUpsertWithoutCompaniesInput {

    @HideField()
    update!: WorkspaceUpdateWithoutCompaniesInput;

    @HideField()
    create!: WorkspaceCreateWithoutCompaniesInput;
}
