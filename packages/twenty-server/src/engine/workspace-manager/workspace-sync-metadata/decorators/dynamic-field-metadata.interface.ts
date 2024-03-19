import { DynamicRelationFieldMetadataDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-computed-relation-field-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export function DynamicRelationFieldMetadata(
  params: DynamicRelationFieldMetadataDecoratorParams,
): PropertyDecorator {
  return (target: object, fieldKey: string) => {
    const isSystem =
      TypedReflect.getMetadata('isSystem', target, fieldKey) ?? false;
    const gate = TypedReflect.getMetadata('gate', target, fieldKey);

    TypedReflect.defineMetadata(
      'dynamicRelationFieldMetadataMap',
      {
        type: FieldMetadataType.RELATION,
        paramsFactory: params,
        isCustom: false,
        isNullable: true,
        isSystem,
        gate,
      },
      target.constructor,
    );
  };
}
