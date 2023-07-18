import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutWorkspaceInput } from './company-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateOrConnectWithoutWorkspaceInput } from './company-create-or-connect-without-workspace.input';
import { CompanyCreateManyWorkspaceInputEnvelope } from './company-create-many-workspace-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CompanyUncheckedCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<CompanyCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<CompanyCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: CompanyCreateManyWorkspaceInputEnvelope;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: Array<CompanyWhereUniqueInput>;
}
