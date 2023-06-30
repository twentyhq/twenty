import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageCreateManyInput } from './pipeline-stage-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyPipelineStageArgs {

    @Field(() => [PipelineStageCreateManyInput], {nullable:false})
    @Type(() => PipelineStageCreateManyInput)
    @ValidateNested({each: true})
    @Type(() => PipelineStageCreateManyInput)
    data!: Array<PipelineStageCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
