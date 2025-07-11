import { Field, InputType, OmitType } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataType } from 'twenty-shared/types';

export type RelationCreationPayload = {
  targetObjectMetadataId: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
  type: RelationType;
};

@InputType()
export class CreateRelationFieldInput extends OmitType(
  FieldMetadataDTO<FieldMetadataType.RELATION>,
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
