import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompositeSubFieldNames } from 'src/modules/dashboard/tools/utils/get-composite-sub-field-names.util';
import { resolveCompositeSubFieldName } from 'src/modules/dashboard/tools/utils/resolve-composite-sub-field-name.util';
import { splitFieldPath } from 'src/modules/dashboard/tools/utils/split-field-path.util';

type CandidateObject = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
};

type CandidateField = {
  id: string;
  name: string;
  label: string;
  objectMetadataId: string;
};

type ResolveGroupByResult = {
  field?: FlatFieldMetadata;
  subFieldName?: string;
  error?: {
    success: false;
    message: string;
    candidates?: {
      fields?: Record<string, CandidateField[]>;
      subFields?: string[];
      objects?: CandidateObject[];
    };
  };
};

export const resolveGroupBy = ({
  fieldValue,
  subFieldValue,
  fieldLabel,
  subFieldLabel,
  targetObjectLabel,
  resolveField,
  buildCandidateField,
  buildCandidateObject,
  allFields,
  fieldsByObjectId,
  flatObjectMetadataMaps,
  warnings,
}: {
  fieldValue: string;
  subFieldValue?: string;
  fieldLabel: string;
  subFieldLabel: string;
  targetObjectLabel: string;
  resolveField: (
    fieldQuery: string,
    fields?: FlatFieldMetadata[],
  ) => FlatFieldMetadata[];
  buildCandidateField: (field: {
    id: string;
    name: string;
    label: string;
    objectMetadataId: string;
  }) => CandidateField;
  buildCandidateObject: (object: {
    id: string;
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
  }) => CandidateObject;
  allFields: FlatFieldMetadata[];
  fieldsByObjectId: Map<string, FlatFieldMetadata[]>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  warnings: string[];
}): ResolveGroupByResult => {
  const { baseField, subFieldPath } = splitFieldPath(fieldValue);

  if (!baseField) {
    return {
      error: {
        success: false,
        message: `Invalid ${fieldLabel}: "${fieldValue}"`,
      },
    };
  }

  if (isDefined(subFieldPath) && isDefined(subFieldValue)) {
    return {
      error: {
        success: false,
        message: `Provide either "${fieldLabel}" dot path or "${subFieldLabel}", not both.`,
      },
    };
  }

  const matches = resolveField(baseField);

  if (matches.length === 0) {
    return {
      error: {
        success: false,
        message: `No field found matching "${baseField}" on ${targetObjectLabel}`,
      },
    };
  }

  if (matches.length > 1) {
    return {
      error: {
        success: false,
        message: `Multiple fields match "${baseField}". Please clarify.`,
        candidates: {
          fields: {
            [fieldLabel]: matches.map(buildCandidateField),
          },
        },
      },
    };
  }

  const field = matches[0];
  const providedSubField = subFieldPath ?? subFieldValue;

  if (isCompositeFieldMetadataType(field.type)) {
    if (!isDefined(providedSubField)) {
      return {
        error: {
          success: false,
          message: `Composite field "${field.name}" requires a subfield.`,
          candidates: {
            subFields: getCompositeSubFieldNames(field.type),
          },
        },
      };
    }

    if (providedSubField.includes('.')) {
      return {
        error: {
          success: false,
          message: `Composite subfield "${providedSubField}" is invalid.`,
          candidates: {
            subFields: getCompositeSubFieldNames(field.type),
          },
        },
      };
    }

    const resolvedSubField = resolveCompositeSubFieldName(
      providedSubField,
      field.type,
    );

    if (!isDefined(resolvedSubField)) {
      return {
        error: {
          success: false,
          message: `Invalid subfield "${providedSubField}" for ${field.name}.`,
          candidates: {
            subFields: getCompositeSubFieldNames(field.type),
          },
        },
      };
    }

    return { field, subFieldName: resolvedSubField };
  }

  if (isMorphOrRelationFlatFieldMetadata(field)) {
    if (!isDefined(providedSubField)) {
      warnings.push(
        `Relation groupBy missing subfield; defaulting to ${field.name}Id`,
      );

      return { field, subFieldName: undefined };
    }

    const dotIndex = providedSubField.indexOf('.');
    const nestedFieldName =
      dotIndex === -1 ? providedSubField : providedSubField.slice(0, dotIndex);
    const nestedSubFieldName =
      dotIndex === -1 ? undefined : providedSubField.slice(dotIndex + 1);

    if (isDefined(nestedSubFieldName) && nestedSubFieldName.includes('.')) {
      return {
        error: {
          success: false,
          message: `Nested subfield "${providedSubField}" is invalid.`,
        },
      };
    }

    let targetObjectId = field.relationTargetObjectMetadataId;

    if (field.type === FieldMetadataType.MORPH_RELATION) {
      const morphTargets = new Set<string>();

      if (isDefined(field.morphId)) {
        allFields.forEach((flatField) => {
          if (
            flatField.morphId === field.morphId &&
            isDefined(flatField.relationTargetObjectMetadataId)
          ) {
            morphTargets.add(flatField.relationTargetObjectMetadataId);
          }
        });
      }

      const morphTargetIds = [...morphTargets];

      if (morphTargetIds.length > 1) {
        const candidates = morphTargetIds
          .map((id) => {
            const identifier =
              flatObjectMetadataMaps.universalIdentifierById[id];

            return identifier
              ? flatObjectMetadataMaps.byUniversalIdentifier[identifier]
              : null;
          })
          .filter(isDefined)
          .filter((object) => object.isActive)
          .map(buildCandidateObject);

        return {
          error: {
            success: false,
            message: `Multiple targets found for "${field.name}". Please clarify the target object.`,
            candidates: { objects: candidates },
          },
        };
      }

      targetObjectId = morphTargetIds[0];
    }

    if (!isDefined(targetObjectId)) {
      return {
        error: {
          success: false,
          message: `Relation field "${field.name}" has no target object.`,
        },
      };
    }

    const targetFields = fieldsByObjectId.get(targetObjectId) ?? [];
    const nestedMatches = resolveField(nestedFieldName, targetFields);

    if (nestedMatches.length === 0) {
      return {
        error: {
          success: false,
          message: `No field found matching "${nestedFieldName}" on relation target.`,
          candidates: {
            subFields: targetFields.map((targetField) => targetField.name),
          },
        },
      };
    }

    if (nestedMatches.length > 1) {
      return {
        error: {
          success: false,
          message: `Multiple fields match "${nestedFieldName}" on relation target.`,
          candidates: {
            subFields: nestedMatches.map((targetField) => targetField.name),
          },
        },
      };
    }

    const nestedField = nestedMatches[0];

    if (
      !isDefined(nestedSubFieldName) &&
      isCompositeFieldMetadataType(nestedField.type)
    ) {
      return {
        error: {
          success: false,
          message: `Composite field "${nestedField.name}" requires a subfield.`,
          candidates: {
            subFields: getCompositeSubFieldNames(nestedField.type),
          },
        },
      };
    }

    if (isDefined(nestedSubFieldName)) {
      if (!isCompositeFieldMetadataType(nestedField.type)) {
        return {
          error: {
            success: false,
            message: `Field "${nestedField.name}" is not composite.`,
          },
        };
      }

      const resolvedNestedSubField = resolveCompositeSubFieldName(
        nestedSubFieldName,
        nestedField.type,
      );

      if (!isDefined(resolvedNestedSubField)) {
        return {
          error: {
            success: false,
            message: `Invalid subfield "${nestedSubFieldName}" for ${nestedField.name}.`,
            candidates: {
              subFields: getCompositeSubFieldNames(nestedField.type),
            },
          },
        };
      }

      return {
        field,
        subFieldName: `${nestedField.name}.${resolvedNestedSubField}`,
      };
    }

    return { field, subFieldName: nestedField.name };
  }

  if (isDefined(providedSubField)) {
    return {
      error: {
        success: false,
        message: `Field "${field.name}" does not support subfields.`,
      },
    };
  }

  return { field, subFieldName: undefined };
};
