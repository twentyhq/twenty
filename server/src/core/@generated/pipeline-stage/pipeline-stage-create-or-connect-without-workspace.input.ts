import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateWithoutWorkspaceInput } from './pipeline-stage-create-without-workspace.input';

@InputType()
export class PipelineStageCreateOrConnectWithoutWorkspaceInput {

    @Field(() => PipelineStageWhereUniqueInput, {nullable:false})
    @Type(() => PipelineStageWhereUniqueInput)
    where!: PipelineStageWhereUniqueInput;

    @Field(() => PipelineStageCreateWithoutWorkspaceInput, {nullable:false})
    @Type(() => PipelineStageCreateWithoutWorkspaceInput)
    create!: PipelineStageCreateWithoutWorkspaceInput;
}
