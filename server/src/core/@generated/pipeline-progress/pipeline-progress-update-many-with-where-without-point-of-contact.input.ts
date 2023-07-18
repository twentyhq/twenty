import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateManyMutationInput } from './pipeline-progress-update-many-mutation.input';

@InputType()
export class PipelineProgressUpdateManyWithWhereWithoutPointOfContactInput {

    @Field(() => PipelineProgressScalarWhereInput, {nullable:false})
    @Type(() => PipelineProgressScalarWhereInput)
    where!: PipelineProgressScalarWhereInput;

    @Field(() => PipelineProgressUpdateManyMutationInput, {nullable:false})
    @Type(() => PipelineProgressUpdateManyMutationInput)
    data!: PipelineProgressUpdateManyMutationInput;
}
