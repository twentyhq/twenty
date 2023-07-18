import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCompaniesInput } from './workspace-create-without-companies.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutCompaniesInput } from './workspace-create-or-connect-without-companies.input';
import { WorkspaceUpsertWithoutCompaniesInput } from './workspace-upsert-without-companies.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceUpdateWithoutCompaniesInput } from './workspace-update-without-companies.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput {

    @HideField()
    create?: WorkspaceCreateWithoutCompaniesInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutCompaniesInput;

    @HideField()
    upsert?: WorkspaceUpsertWithoutCompaniesInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;

    @HideField()
    update?: WorkspaceUpdateWithoutCompaniesInput;
}
