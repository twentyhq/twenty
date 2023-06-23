import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateNestedOneWithoutPipelineStagesInput } from '../pipeline/pipeline-create-nested-one-without-pipeline-stages.input';
import { PipelineProgressCreateNestedManyWithoutPipelineStageInput } from '../pipeline-progress/pipeline-progress-create-nested-many-without-pipeline-stage.input';

@InputType()
export class PipelineStageCreateWithoutWorkspaceInput {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    type!: string;

    @Field(() => String, {nullable:false})
    color!: string;

    @Field(() => PipelineCreateNestedOneWithoutPipelineStagesInput, {nullable:false})
    pipeline!: PipelineCreateNestedOneWithoutPipelineStagesInput;

    @Field(() => PipelineProgressCreateNestedManyWithoutPipelineStageInput, {nullable:true})
    pipelineProgresses?: PipelineProgressCreateNestedManyWithoutPipelineStageInput;
}
