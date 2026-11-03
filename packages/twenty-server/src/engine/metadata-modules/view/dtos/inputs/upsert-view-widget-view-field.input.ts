import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { AggregateOperations, ConditionalDisplay } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AtLeastOneOf } from 'src/engine/metadata-modules/view-field-group/dtos/validators/at-least-one-of.validator';

@InputType()
@AtLeastOneOf(['viewFieldId', 'fieldMetadataId'])
export class UpsertViewWidgetViewFieldInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, {
    nullable: true,
    description: 'The id of an existing view field to update.',
  })
  viewFieldId?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, {
    nullable: true,
    description:
      'The field metadata id. Used to create a new view field when viewFieldId is not provided.',
  })
  fieldMetadataId?: string;

  @IsBoolean()
  @Field()
  isVisible: boolean;

  @IsNumber()
  @Field()
  position: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  size?: number;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations | null;

  @IsOptional()
  @IsObject()
  @Field(() => GraphQLJSON, { nullable: true })
  conditionalDisplay?: ConditionalDisplay | null;
}
