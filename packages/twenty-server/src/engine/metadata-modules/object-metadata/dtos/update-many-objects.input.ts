import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';

import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

const MAX_OBJECTS_PER_UPDATE = 100;

@InputType()
export class UpdateManyObjectsInput {
  @Type(() => UpdateOneObjectInput)
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_OBJECTS_PER_UPDATE)
  @Field(() => [UpdateOneObjectInput])
  updates: UpdateOneObjectInput[];
}
