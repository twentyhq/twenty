import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateWithoutPipelineProgressInput } from './person-create-without-pipeline-progress.input';
import { Type } from 'class-transformer';
import { PersonCreateOrConnectWithoutPipelineProgressInput } from './person-create-or-connect-without-pipeline-progress.input';
import { PersonUpsertWithoutPipelineProgressInput } from './person-upsert-without-pipeline-progress.input';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { PersonUpdateWithoutPipelineProgressInput } from './person-update-without-pipeline-progress.input';

@InputType()
export class PersonUpdateOneWithoutPipelineProgressNestedInput {

    @Field(() => PersonCreateWithoutPipelineProgressInput, {nullable:true})
    @Type(() => PersonCreateWithoutPipelineProgressInput)
    create?: PersonCreateWithoutPipelineProgressInput;

    @Field(() => PersonCreateOrConnectWithoutPipelineProgressInput, {nullable:true})
    @Type(() => PersonCreateOrConnectWithoutPipelineProgressInput)
    connectOrCreate?: PersonCreateOrConnectWithoutPipelineProgressInput;

    @Field(() => PersonUpsertWithoutPipelineProgressInput, {nullable:true})
    @Type(() => PersonUpsertWithoutPipelineProgressInput)
    upsert?: PersonUpsertWithoutPipelineProgressInput;

    @Field(() => Boolean, {nullable:true})
    disconnect?: boolean;

    @Field(() => Boolean, {nullable:true})
    delete?: boolean;

    @Field(() => PersonWhereUniqueInput, {nullable:true})
    @Type(() => PersonWhereUniqueInput)
    connect?: PersonWhereUniqueInput;

    @Field(() => PersonUpdateWithoutPipelineProgressInput, {nullable:true})
    @Type(() => PersonUpdateWithoutPipelineProgressInput)
    update?: PersonUpdateWithoutPipelineProgressInput;
}
