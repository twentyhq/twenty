import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageScalarWhereInput } from './pipeline-stage-scalar-where.input';
import { Type } from 'class-transformer';
import { PipelineStageUpdateManyMutationInput } from './pipeline-stage-update-many-mutation.input';

@InputType()
export class PipelineStageUpdateManyWithWhereWithoutWorkspaceInput {

    @Field(() => PipelineStageScalarWhereInput, {nullable:false})
    @Type(() => PipelineStageScalarWhereInput)
    where!: PipelineStageScalarWhereInput;

    @Field(() => PipelineStageUpdateManyMutationInput, {nullable:false})
    @Type(() => PipelineStageUpdateManyMutationInput)
    data!: PipelineStageUpdateManyMutationInput;
}
