import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// The emitted action is not part of the contract yet: the relation field
// settings only offer logging on link, and a wider input would let clients
// create emitters no surface can manage.
@InputType()
export class CreateTimelineActivityTypeInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  targetRelationFieldMetadataId: string;
}
