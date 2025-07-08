import { Field, InputType, OmitType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export type RelationCreationPayload = {
  targetObjectMetadataId: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
  type: RelationType;
};
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

  // TODO @prastoin implement validation for this with validate nested and dedicated class instance
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  relationCreationPayload?: RelationCreationPayload;

  @IsOptional()
  @Field(() => [GraphQLJSON], { nullable: true })
  morphRelationsCreationPayload?: RelationCreationPayload[];
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
