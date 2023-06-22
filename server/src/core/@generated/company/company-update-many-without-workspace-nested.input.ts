import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateWithoutWorkspaceInput } from './company-create-without-workspace.input';
import { Type } from 'class-transformer';
import { CompanyCreateOrConnectWithoutWorkspaceInput } from './company-create-or-connect-without-workspace.input';
import { CompanyUpsertWithWhereUniqueWithoutWorkspaceInput } from './company-upsert-with-where-unique-without-workspace.input';
import { CompanyCreateManyWorkspaceInputEnvelope } from './company-create-many-workspace-input-envelope.input';
import { CompanyWhereUniqueInput } from './company-where-unique.input';
import { CompanyUpdateWithWhereUniqueWithoutWorkspaceInput } from './company-update-with-where-unique-without-workspace.input';
import { CompanyUpdateManyWithWhereWithoutWorkspaceInput } from './company-update-many-with-where-without-workspace.input';
import { CompanyScalarWhereInput } from './company-scalar-where.input';

@InputType()
export class CompanyUpdateManyWithoutWorkspaceNestedInput {

    @Field(() => [CompanyCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => CompanyCreateWithoutWorkspaceInput)
    create?: Array<CompanyCreateWithoutWorkspaceInput>;

    @Field(() => [CompanyCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => CompanyCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<CompanyCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => [CompanyUpsertWithWhereUniqueWithoutWorkspaceInput], {nullable:true})
    @Type(() => CompanyUpsertWithWhereUniqueWithoutWorkspaceInput)
    upsert?: Array<CompanyUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @Field(() => CompanyCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => CompanyCreateManyWorkspaceInputEnvelope)
    createMany?: CompanyCreateManyWorkspaceInputEnvelope;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    set?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    disconnect?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    delete?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyWhereUniqueInput], {nullable:true})
    @Type(() => CompanyWhereUniqueInput)
    connect?: Array<CompanyWhereUniqueInput>;

    @Field(() => [CompanyUpdateWithWhereUniqueWithoutWorkspaceInput], {nullable:true})
    @Type(() => CompanyUpdateWithWhereUniqueWithoutWorkspaceInput)
    update?: Array<CompanyUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @Field(() => [CompanyUpdateManyWithWhereWithoutWorkspaceInput], {nullable:true})
    @Type(() => CompanyUpdateManyWithWhereWithoutWorkspaceInput)
    updateMany?: Array<CompanyUpdateManyWithWhereWithoutWorkspaceInput>;

    @Field(() => [CompanyScalarWhereInput], {nullable:true})
    @Type(() => CompanyScalarWhereInput)
    deleteMany?: Array<CompanyScalarWhereInput>;
}
