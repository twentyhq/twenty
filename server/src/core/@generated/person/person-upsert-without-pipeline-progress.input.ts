import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonUpdateWithoutPipelineProgressInput } from './person-update-without-pipeline-progress.input';
import { Type } from 'class-transformer';
import { PersonCreateWithoutPipelineProgressInput } from './person-create-without-pipeline-progress.input';

@InputType()
export class PersonUpsertWithoutPipelineProgressInput {

    @Field(() => PersonUpdateWithoutPipelineProgressInput, {nullable:false})
    @Type(() => PersonUpdateWithoutPipelineProgressInput)
    update!: PersonUpdateWithoutPipelineProgressInput;

    @Field(() => PersonCreateWithoutPipelineProgressInput, {nullable:false})
    @Type(() => PersonCreateWithoutPipelineProgressInput)
    create!: PersonCreateWithoutPipelineProgressInput;
}
