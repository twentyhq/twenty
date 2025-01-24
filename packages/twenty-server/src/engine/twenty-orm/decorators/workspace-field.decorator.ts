import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface WorkspaceFieldOptions<
  T extends FieldMetadataType | 'default',
> {
  standardId: string;
  type: T;
  label: string | ((objectMetadata: ObjectMetadataEntity) => string);
  description?: string | ((objectMetadata: ObjectMetadataEntity) => string);
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  settings?: FieldMetadataSettings<T>;
  isActive?: boolean;
  generatedType?: 'STORED' | 'VIRTUAL';
  asExpression?: string;
}

export function WorkspaceField<T extends FieldMetadataType>(
  options: WorkspaceFieldOptions<T>,
): PropertyDecorator {
  return (object, propertyKey) => {
    const isPrimary =
      TypedReflect.getMetadata(
        'workspace:is-primary-field-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isNullable =
      TypedReflect.getMetadata(
        'workspace:is-nullable-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isSystem =
      TypedReflect.getMetadata(
        'workspace:is-system-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      object,
      propertyKey.toString(),
    );
    const isDeprecated =
      TypedReflect.getMetadata(
        'workspace:is-deprecated-field-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isUnique =
      TypedReflect.getMetadata(
        'workspace:is-unique-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;

    const defaultValue = (options.defaultValue ??
      generateDefaultValue(options.type)) as FieldMetadataDefaultValue | null;

    metadataArgsStorage.addFields({
      target: object.constructor,
      standardId: options.standardId,
      name: propertyKey.toString(),
      label: options.label,
      type: options.type,
      description: options.description,
      icon: options.icon,
      defaultValue,
      options: options.options,
      settings: options.settings,
      isPrimary,
      isNullable,
      isSystem,
      gate,
      isDeprecated,
      isUnique,
      isActive: options.isActive,
      asExpression: options.asExpression,
      generatedType: options.generatedType,
    });
  };
}
