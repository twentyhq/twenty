import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateManyPointOfContactInput } from './pipeline-progress-create-many-point-of-contact.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineProgressCreateManyPointOfContactInputEnvelope {

    @Field(() => [PipelineProgressCreateManyPointOfContactInput], {nullable:false})
    @Type(() => PipelineProgressCreateManyPointOfContactInput)
    data!: Array<PipelineProgressCreateManyPointOfContactInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
