import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutWorkspaceInput } from './pipeline-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateOrConnectWithoutWorkspaceInput } from './pipeline-create-or-connect-without-workspace.input';
import { PipelineUpsertWithWhereUniqueWithoutWorkspaceInput } from './pipeline-upsert-with-where-unique-without-workspace.input';
import { PipelineCreateManyWorkspaceInputEnvelope } from './pipeline-create-many-workspace-input-envelope.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineUpdateWithWhereUniqueWithoutWorkspaceInput } from './pipeline-update-with-where-unique-without-workspace.input';
import { PipelineUpdateManyWithWhereWithoutWorkspaceInput } from './pipeline-update-many-with-where-without-workspace.input';
import { PipelineScalarWhereInput } from './pipeline-scalar-where.input';

@InputType()
export class PipelineUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<PipelineCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PipelineCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<PipelineUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: PipelineCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineWhereUniqueInput], {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    set?: Array<PipelineWhereUniqueInput>;

    @Field(() => [PipelineWhereUniqueInput], {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    disconnect?: Array<PipelineWhereUniqueInput>;

    @HideField()
    delete?: Array<PipelineWhereUniqueInput>;

    @Field(() => [PipelineWhereUniqueInput], {nullable:true})
    @Type(() => PipelineWhereUniqueInput)
    connect?: Array<PipelineWhereUniqueInput>;

    @HideField()
    update?: Array<PipelineUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<PipelineUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<PipelineScalarWhereInput>;
}
