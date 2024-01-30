import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

import { IsValidGraphQLEnumName } from 'src/metadata/field-metadata/validators/is-valid-graphql-enum-name.validator';

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
  color: string;
}
