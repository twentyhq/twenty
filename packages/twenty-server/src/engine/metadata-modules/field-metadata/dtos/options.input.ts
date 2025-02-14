import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { IsValidGraphQLEnumName } from 'src/engine/metadata-modules/field-metadata/validators/is-valid-graphql-enum-name.validator';

export type TagColor =
  | 'green'
  | 'turquoise'
  | 'sky'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'gray';

export class FieldMetadataDefaultOption {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNumber()
  position: number;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsValidGraphQLEnumName()
  value: string;
}

export class FieldMetadataComplexOption extends FieldMetadataDefaultOption {
  @IsNotEmpty()
  @IsString()
  color: TagColor;
}
