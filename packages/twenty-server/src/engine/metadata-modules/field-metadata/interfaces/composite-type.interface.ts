import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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
