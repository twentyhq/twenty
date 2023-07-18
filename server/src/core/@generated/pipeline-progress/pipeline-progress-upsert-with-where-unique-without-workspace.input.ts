import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithoutWorkspaceInput } from './pipeline-progress-update-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutWorkspaceInput } from './pipeline-progress-create-without-workspace.input';

@InputType()
export class PipelineProgressUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:false})
    @Type(() => PipelineProgressWhereUniqueInput)
    where!: PipelineProgressWhereUniqueInput;

    @HideField()
    update!: PipelineProgressUpdateWithoutWorkspaceInput;

    @HideField()
    create!: PipelineProgressCreateWithoutWorkspaceInput;
}
