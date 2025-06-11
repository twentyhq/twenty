import { Field, InputType, OmitType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

@InputType()
export class CreateFieldInput extends OmitType(
  FieldMetadataDTO,
  ['id', 'createdAt', 'updatedAt', 'standardOverrides'] as const,
  InputType,
) {
  @IsUUID()
  @Field()
  objectMetadataId: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isRemoteCreation?: boolean;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  relationCreationPayload?: {
    targetObjectMetadataId: string;
    targetFieldLabel: string;
    targetFieldIcon: string;
    type: RelationType;
  };
}

@InputType()
export class CreateOneFieldMetadataInput {
  @Type(() => CreateFieldInput)
  @ValidateNested()
  @Field(() => CreateFieldInput, {
    description: 'The record to create',
  })
  field!: CreateFieldInput;
}
