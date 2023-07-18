import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateWithoutWorkspaceInput } from './pipeline-stage-update-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCreateWithoutWorkspaceInput } from './pipeline-stage-create-without-workspace.input';

@InputType()
export class PipelineStageUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => PipelineStageWhereUniqueInput, {nullable:false})
    @Type(() => PipelineStageWhereUniqueInput)
    where!: PipelineStageWhereUniqueInput;

    @HideField()
    update!: PipelineStageUpdateWithoutWorkspaceInput;

    @HideField()
    create!: PipelineStageCreateWithoutWorkspaceInput;
}
