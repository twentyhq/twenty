import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithoutPointOfContactInput } from './pipeline-progress-update-without-point-of-contact.input';
import { PipelineProgressCreateWithoutPointOfContactInput } from './pipeline-progress-create-without-point-of-contact.input';

@InputType()
export class PipelineProgressUpsertWithWhereUniqueWithoutPointOfContactInput {

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:false})
    @Type(() => PipelineProgressWhereUniqueInput)
    where!: PipelineProgressWhereUniqueInput;

    @Field(() => PipelineProgressUpdateWithoutPointOfContactInput, {nullable:false})
    @Type(() => PipelineProgressUpdateWithoutPointOfContactInput)
    update!: PipelineProgressUpdateWithoutPointOfContactInput;

    @Field(() => PipelineProgressCreateWithoutPointOfContactInput, {nullable:false})
    @Type(() => PipelineProgressCreateWithoutPointOfContactInput)
    create!: PipelineProgressCreateWithoutPointOfContactInput;
}
