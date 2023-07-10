import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressCreateManyInput } from './pipeline-progress-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyPipelineProgressArgs {

    @Field(() => [PipelineProgressCreateManyInput], {nullable:false})
    @Type(() => PipelineProgressCreateManyInput)
    @ValidateNested({each: true})
    @Type(() => PipelineProgressCreateManyInput)
    data!: Array<PipelineProgressCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
