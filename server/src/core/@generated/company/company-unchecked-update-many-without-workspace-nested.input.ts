import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutWorkspaceInput } from './company-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CompanyCreateOrConnectWithoutWorkspaceInput } from './company-create-or-connect-without-workspace.input';
import { CompanyUpsertWithWhereUniqueWithoutWorkspaceInput } from './company-upsert-with-where-unique-without-workspace.input';
import { CompanyCreateManyWorkspaceInputEnvelope } from './company-create-many-workspace-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { Type } from 'class-transformer';
import { CompanyUpdateWithWhereUniqueWithoutWorkspaceInput } from './company-update-with-where-unique-without-workspace.input';
import { CompanyUpdateManyWithWhereWithoutWorkspaceInput } from './company-update-many-with-where-without-workspace.input';
import { CompanyScalarWhereInput } from './company-scalar-where.input';

@InputType()
export class CompanyUncheckedUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<CompanyCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<CompanyCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<CompanyUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: CompanyCreateManyWorkspaceInputEnvelope;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    set?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    disconnect?: Array<CompanyWhereUniqueInput>;

    @HideField()
    delete?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: Array<CompanyWhereUniqueInput>;

    @HideField()
    update?: Array<CompanyUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<CompanyUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<CompanyScalarWhereInput>;
}
