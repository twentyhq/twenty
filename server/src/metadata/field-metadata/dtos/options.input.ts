import { IsString, IsNumber, IsOptional } from 'class-validator';

export class FieldMetadataDefaultOptions {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNumber()
  position: number;

  @IsString()
  label: string;

  @IsString()
  value: string;
}

export class FieldMetadataComplexOptions extends FieldMetadataDefaultOptions {
  @IsOptional()
  @IsString()
  color: string;
}
