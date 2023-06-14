import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereInput } from './pipeline-progress-where.input';

@InputType()
export class PipelineProgressListRelationFilter {

    @Field(() => PipelineProgressWhereInput, {nullable:true})
    every?: PipelineProgressWhereInput;

    @Field(() => PipelineProgressWhereInput, {nullable:true})
    some?: PipelineProgressWhereInput;

    @Field(() => PipelineProgressWhereInput, {nullable:true})
    none?: PipelineProgressWhereInput;
}
