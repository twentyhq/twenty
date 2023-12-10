import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class FieldMetadataDefaultOptions {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNumber()
  position: number;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export class FieldMetadataComplexOptions extends FieldMetadataDefaultOptions {
  @IsNotEmpty()
  @IsString()
  color: string;
}
