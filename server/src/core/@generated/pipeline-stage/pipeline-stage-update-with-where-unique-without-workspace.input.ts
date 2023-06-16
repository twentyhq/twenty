import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateWithoutWorkspaceInput } from './pipeline-stage-update-without-workspace.input';

@InputType()
export class PipelineStageUpdateWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => PipelineStageWhereUniqueInput, {nullable:false})
    @Type(() => PipelineStageWhereUniqueInput)
    where!: PipelineStageWhereUniqueInput;

    @Field(() => PipelineStageUpdateWithoutWorkspaceInput, {nullable:false})
    @Type(() => PipelineStageUpdateWithoutWorkspaceInput)
    data!: PipelineStageUpdateWithoutWorkspaceInput;
}
