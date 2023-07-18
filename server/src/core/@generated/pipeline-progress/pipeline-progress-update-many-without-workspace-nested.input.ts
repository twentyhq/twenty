import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutWorkspaceInput } from './pipeline-progress-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateOrConnectWithoutWorkspaceInput } from './pipeline-progress-create-or-connect-without-workspace.input';
import { PipelineProgressUpsertWithWhereUniqueWithoutWorkspaceInput } from './pipeline-progress-upsert-with-where-unique-without-workspace.input';
import { PipelineProgressCreateManyWorkspaceInputEnvelope } from './pipeline-progress-create-many-workspace-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithWhereUniqueWithoutWorkspaceInput } from './pipeline-progress-update-with-where-unique-without-workspace.input';
import { PipelineProgressUpdateManyWithWhereWithoutWorkspaceInput } from './pipeline-progress-update-many-with-where-without-workspace.input';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';

@InputType()
export class PipelineProgressUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<PipelineProgressCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<PipelineProgressUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: PipelineProgressCreateManyWorkspaceInputEnvelope;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    set?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    disconnect?: Array<PipelineProgressWhereUniqueInput>;

    @HideField()
    delete?: Array<PipelineProgressWhereUniqueInput>;

    @Field(() => [PipelineProgressWhereUniqueInput], {nullable:true})
    @Type(() => PipelineProgressWhereUniqueInput)
    connect?: Array<PipelineProgressWhereUniqueInput>;

    @HideField()
    update?: Array<PipelineProgressUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<PipelineProgressUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<PipelineProgressScalarWhereInput>;
}
