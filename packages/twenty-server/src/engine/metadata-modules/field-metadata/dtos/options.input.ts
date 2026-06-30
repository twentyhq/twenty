import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsValidGraphQLEnumName } from 'twenty-shared/types';

export type TagColor =
  | 'red'
  | 'ruby'
  | 'crimson'
  | 'tomato'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'grass'
  | 'green'
  | 'jade'
  | 'mint'
  | 'turquoise'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'iris'
  | 'violet'
  | 'purple'
  | 'plum'
  | 'pink'
  | 'bronze'
  | 'gold'
  | 'brown'
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
