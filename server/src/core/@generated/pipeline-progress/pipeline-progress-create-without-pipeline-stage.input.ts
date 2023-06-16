import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { PipelineCreateNestedOneWithoutPipelineProgressesInput } from '../pipeline/pipeline-create-nested-one-without-pipeline-progresses.input';
import { WorkspaceCreateNestedOneWithoutPipelineProgressesInput } from '../workspace/workspace-create-nested-one-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineProgressCreateWithoutPipelineStageInput {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => PipelineProgressableType, {nullable:false})
    progressableType!: keyof typeof PipelineProgressableType;

    @Field(() => String, {nullable:false})
    progressableId!: string;

    @Field(() => PipelineCreateNestedOneWithoutPipelineProgressesInput, {nullable:false})
    pipeline!: PipelineCreateNestedOneWithoutPipelineProgressesInput;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutPipelineProgressesInput;
}
