import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsValidGraphQLEnumName, type TagColor } from 'twenty-shared/types';

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
