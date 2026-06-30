import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { CreateIndexInput } from 'src/engine/metadata-modules/index-metadata/dtos/create-index.input';

@InputType()
export class CreateOneIndexInput {
  @Type(() => CreateIndexInput)
  @ValidateNested()
  @Field(() => CreateIndexInput, {
    description: 'The custom index to create',
  })
  index!: CreateIndexInput;
}
