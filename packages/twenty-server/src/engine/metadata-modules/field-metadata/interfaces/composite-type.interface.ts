import {
  type FieldMetadataType,
  type FieldMetadataOptions,
} from 'twenty-shared/types';

export interface CompositeProperty<
  Type extends FieldMetadataType = FieldMetadataType,
> {
  name: string;
  description?: string;
  type: Type;
  hidden: 'input' | 'output' | true | false;
  isRequired: boolean;
  isIncludedInUniqueConstraint?: boolean;
  isArray?: boolean;
  options?: FieldMetadataOptions<Type>;
}

export interface CompositeType {
  type: FieldMetadataType;
  properties: CompositeProperty[];
}
