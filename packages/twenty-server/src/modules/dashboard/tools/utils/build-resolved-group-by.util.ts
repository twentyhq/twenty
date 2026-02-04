import { isDefined } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { humanizeSubFieldLabel } from 'src/modules/dashboard/tools/utils/humanize-sub-field-label.util';

type ResolvedGroupBy = {
  fieldName: string;
  fieldLabel: string;
  fullPath: string;
  subFieldName?: string;
  subFieldLabel?: string;
};

export const buildResolvedGroupBy = ({
  fieldId,
  subFieldName,
  getFieldById,
  fieldsByObjectId,
}: {
  fieldId?: string | null;
  subFieldName?: string | null;
  getFieldById: (fieldId?: string | null) => FlatFieldMetadata | null;
  fieldsByObjectId: Map<string, FlatFieldMetadata[]>;
}) => {
  const field = getFieldById(fieldId);

  if (!isDefined(field)) return null;

  const resolved: ResolvedGroupBy = {
    fieldName: field.name,
    fieldLabel: field.label ?? field.name,
    fullPath: field.name,
  };

  if (isMorphOrRelationFlatFieldMetadata(field)) {
    if (isDefined(subFieldName)) {
      resolved.subFieldName = subFieldName;
      resolved.fullPath = `${field.name}.${subFieldName}`;

      const dotIndex = subFieldName.indexOf('.');
      const nestedFieldName =
        dotIndex === -1 ? subFieldName : subFieldName.slice(0, dotIndex);
      const nestedSubFieldName =
        dotIndex === -1 ? undefined : subFieldName.slice(dotIndex + 1);

      const targetFields = isDefined(field.relationTargetObjectMetadataId)
        ? (fieldsByObjectId.get(field.relationTargetObjectMetadataId) ?? [])
        : [];
      const nestedField = targetFields.find(
        (targetField) => targetField.name === nestedFieldName,
      );

      if (isDefined(nestedField)) {
        if (!isDefined(nestedSubFieldName)) {
          resolved.subFieldLabel = nestedField.label ?? nestedField.name;
        } else if (isCompositeFieldMetadataType(nestedField.type)) {
          resolved.subFieldLabel = humanizeSubFieldLabel(nestedSubFieldName);
        }
      }
    } else {
      resolved.fullPath = `${field.name}Id`;
    }

    return resolved;
  }

  if (isCompositeFieldMetadataType(field.type)) {
    if (isDefined(subFieldName)) {
      resolved.subFieldName = subFieldName;
      resolved.subFieldLabel = humanizeSubFieldLabel(subFieldName);
      resolved.fullPath = `${field.name}.${subFieldName}`;
    }

    return resolved;
  }

  return resolved;
};
