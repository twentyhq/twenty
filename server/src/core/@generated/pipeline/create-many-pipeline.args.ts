import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineCreateManyInput } from './pipeline-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyPipelineArgs {

    @Field(() => [PipelineCreateManyInput], {nullable:false})
    @Type(() => PipelineCreateManyInput)
    @Type(() => PipelineCreateManyInput)
    @ValidateNested({each: true})
    data!: Array<PipelineCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
