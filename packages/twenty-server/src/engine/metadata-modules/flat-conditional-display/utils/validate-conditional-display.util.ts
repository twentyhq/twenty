import { msg, t } from '@lingui/core/macro';
import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import {
  CONDITIONAL_DISPLAY_CONTEXT_KEYS,
  CONDITIONAL_DISPLAY_DEVICES,
} from 'twenty-shared/constants';
import {
  type ConditionalDisplayContextKey,
  type ConditionalDisplaySurface,
  RecordFilterGroupLogicalOperator,
  type UniversalConditionalDisplay,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isPlainObject,
  jsonRelationFilterValueSchema,
  parseJson,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { parseConditionalDisplayRoleIds } from 'src/engine/metadata-modules/flat-conditional-display/utils/parse-conditional-display-role-ids.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { validateRecordFilterFieldLeaf } from 'src/engine/metadata-modules/flat-field-metadata/utils/validate-record-filter-field-leaf.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type UniversalConditionalDisplayRecordFilter = NonNullable<
  UniversalConditionalDisplay['recordFilters']
>[number];

type UniversalConditionalDisplayRecordFilterGroup = NonNullable<
  UniversalConditionalDisplay['recordFilterGroups']
>[number];

type ValidateConditionalDisplayContext = {
  surface: ConditionalDisplaySurface;
  objectMetadataUniversalIdentifier: string | null;
  invalidDataCode: string;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataUniversalFlatEntityMaps<'role'>;
};

const SINGLE_DEVICE_SCHEMA = z.tuple([z.enum(CONDITIONAL_DISPLAY_DEVICES)]);

const isConditionalDisplayContextKey = (
  contextKey: string,
): contextKey is ConditionalDisplayContextKey =>
  Object.keys(CONDITIONAL_DISPLAY_CONTEXT_KEYS).includes(contextKey);

const isRecordFilterGroupLogicalOperator = (
  logicalOperator: unknown,
): logicalOperator is RecordFilterGroupLogicalOperator =>
  Object.values<unknown>(RecordFilterGroupLogicalOperator).includes(
    logicalOperator,
  );

const validateContextRecordFilter = ({
  recordFilter,
  contextKey,
  surface,
  invalidDataCode,
  flatRoleMaps,
}: {
  recordFilter: UniversalConditionalDisplayRecordFilter;
  contextKey: string;
} & Pick<
  ValidateConditionalDisplayContext,
  'surface' | 'invalidDataCode' | 'flatRoleMaps'
>): FlatEntityValidationError[] => {
  if (!isConditionalDisplayContextKey(contextKey)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display context key "${contextKey}" is not supported`,
        userFriendlyMessage: msg`Conditional display rule uses an unknown subject`,
        value: contextKey,
      },
    ];
  }

  const { valueKind, surfaces } = CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey];

  if (!surfaces.includes(surface)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display context key "${contextKey}" is not allowed on ${surface}`,
        userFriendlyMessage: msg`Conditional display rule uses a subject that is not available here`,
        value: contextKey,
      },
    ];
  }

  const operand = recordFilter.operand;

  if (operand !== ViewFilterOperand.IS) {
    return [
      {
        code: invalidDataCode,
        message: t`Operand "${operand}" is not supported on conditional display context key "${contextKey}"`,
        userFriendlyMessage: msg`Conditional display rule operand is not supported`,
        value: operand,
      },
    ];
  }

  const value = recordFilter.value ?? '';

  switch (valueKind) {
    case 'ROLE_IDS': {
      const roleUniversalIdentifiers = parseConditionalDisplayRoleIds(value);

      if (!isDefined(roleUniversalIdentifiers)) {
        return [
          {
            code: invalidDataCode,
            message: t`Value "${value}" of conditional display context key "${contextKey}" must be a JSON array of role identifiers`,
            userFriendlyMessage: msg`Conditional display role value is not valid`,
            value,
          },
        ];
      }

      return roleUniversalIdentifiers
        .filter(
          (roleUniversalIdentifier) =>
            !isDefined(
              findFlatEntityByUniversalIdentifier({
                flatEntityMaps: flatRoleMaps,
                universalIdentifier: roleUniversalIdentifier,
              }),
            ),
        )
        .map((roleUniversalIdentifier) => ({
          code: invalidDataCode,
          message: t`Role "${roleUniversalIdentifier}" referenced by a conditional display rule does not exist`,
          userFriendlyMessage: msg`Conditional display rule references a role that does not exist`,
          value: roleUniversalIdentifier,
        }));
    }
    case 'WORKSPACE_MEMBER': {
      if (jsonRelationFilterValueSchema.safeParse(value).success) {
        return [];
      }

      return [
        {
          code: invalidDataCode,
          message: t`Value "${value}" of conditional display context key "${contextKey}" is not a valid workspace member selection`,
          userFriendlyMessage: msg`Conditional display workspace member value is not valid`,
          value,
        },
      ];
    }
    case 'DEVICE': {
      if (SINGLE_DEVICE_SCHEMA.safeParse(parseJson<unknown>(value)).success) {
        return [];
      }

      const allowedDevicesText = CONDITIONAL_DISPLAY_DEVICES.join(', ');

      return [
        {
          code: invalidDataCode,
          message: t`Value "${value}" of conditional display context key "${contextKey}" must be a JSON array with exactly one of: ${allowedDevicesText}`,
          userFriendlyMessage: msg`Conditional display device value is not valid`,
          value,
        },
      ];
    }
  }
};

const validateFieldRecordFilter = ({
  recordFilter,
  fieldMetadataUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  surface,
  invalidDataCode,
  flatFieldMetadataMaps,
}: {
  recordFilter: UniversalConditionalDisplayRecordFilter;
  fieldMetadataUniversalIdentifier: string;
} & Pick<
  ValidateConditionalDisplayContext,
  | 'objectMetadataUniversalIdentifier'
  | 'surface'
  | 'invalidDataCode'
  | 'flatFieldMetadataMaps'
>): FlatEntityValidationError[] => {
  if (!isDefined(objectMetadataUniversalIdentifier)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display rules on ${surface} cannot reference a record field`,
        userFriendlyMessage: msg`Conditional display rule cannot use a record field here`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  const filterField = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  if (
    !isDefined(filterField) ||
    filterField.objectMetadataUniversalIdentifier !==
      objectMetadataUniversalIdentifier
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Field "${fieldMetadataUniversalIdentifier}" of a conditional display rule does not belong to object "${objectMetadataUniversalIdentifier}"`,
        userFriendlyMessage: msg`Conditional display rule references a field that does not belong to this object`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  const { relationTargetFieldMetadataUniversalIdentifier } = recordFilter;

  const relationTargetField = isDefined(
    relationTargetFieldMetadataUniversalIdentifier,
  )
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
      })
    : undefined;

  if (
    isDefined(relationTargetFieldMetadataUniversalIdentifier) &&
    !isDefined(relationTargetField)
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Relation target field "${relationTargetFieldMetadataUniversalIdentifier}" of a conditional display rule does not exist`,
        userFriendlyMessage: msg`Conditional display rule references a field that does not exist`,
        value: relationTargetFieldMetadataUniversalIdentifier,
      },
    ];
  }

  return validateRecordFilterFieldLeaf<FlatEntityValidationError>({
    recordFilter,
    filterField,
    relationTargetField,
    buildUnsupportedOperandError: ({
      rawOperand,
      effectiveFieldType,
      allowedOperandsText,
    }) => ({
      code: invalidDataCode,
      message: t`Operand "${rawOperand}" of a conditional display rule is not supported on field type "${effectiveFieldType}". Supported operands: ${allowedOperandsText}.`,
      userFriendlyMessage: msg`Conditional display rule operand is not supported for this field type`,
      value: rawOperand,
    }),
    buildInvalidValueError: ({
      stringifiedValue,
      operand,
      filterType,
      hint,
    }) => ({
      code: invalidDataCode,
      message: isNonEmptyString(hint)
        ? t`Value "${stringifiedValue}" of a conditional display rule is not valid for operand "${operand}" on field type "${filterType}". ${hint}`
        : t`Value "${stringifiedValue}" of a conditional display rule is not valid for operand "${operand}" on field type "${filterType}".`,
      userFriendlyMessage: msg`Conditional display rule value is not valid for this operand`,
      value: recordFilter.value,
    }),
  });
};

const validateRecordFilter = ({
  recordFilter,
  recordFilterGroupIds,
  context,
}: {
  recordFilter: UniversalConditionalDisplayRecordFilter;
  recordFilterGroupIds: Set<string>;
  context: ValidateConditionalDisplayContext;
}): FlatEntityValidationError[] => {
  const {
    id: recordFilterId,
    fieldMetadataUniversalIdentifier,
    contextKey,
    recordFilterGroupId,
  } = recordFilter;
  const { invalidDataCode } = context;

  if (isDefined(fieldMetadataUniversalIdentifier) === isDefined(contextKey)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display rule "${recordFilterId}" must reference exactly one of a field or a context key`,
        userFriendlyMessage: msg`Conditional display rule must have exactly one subject`,
        value: recordFilterId,
      },
    ];
  }

  if (
    isDefined(recordFilterGroupId) &&
    !recordFilterGroupIds.has(recordFilterGroupId)
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display rule "${recordFilterId}" references unknown group "${recordFilterGroupId}"`,
        userFriendlyMessage: msg`Conditional display rule references a group that does not exist`,
        value: recordFilterGroupId,
      },
    ];
  }

  if (isDefined(contextKey)) {
    return validateContextRecordFilter({
      recordFilter,
      contextKey,
      ...context,
    });
  }

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    return [];
  }

  return validateFieldRecordFilter({
    recordFilter,
    fieldMetadataUniversalIdentifier,
    ...context,
  });
};

const validateRecordFilterGroups = ({
  recordFilterGroups,
  invalidDataCode,
}: {
  recordFilterGroups: UniversalConditionalDisplayRecordFilterGroup[];
  invalidDataCode: string;
}): FlatEntityValidationError[] => {
  const parentGroupIdByGroupId = new Map(
    recordFilterGroups.map((recordFilterGroup) => [
      recordFilterGroup.id,
      recordFilterGroup.parentRecordFilterGroupId ?? null,
    ]),
  );

  return recordFilterGroups.flatMap(
    ({ id: recordFilterGroupId, logicalOperator }) => {
      if (!isRecordFilterGroupLogicalOperator(logicalOperator)) {
        return [
          {
            code: invalidDataCode,
            message: t`Conditional display group "${recordFilterGroupId}" has an unsupported logical operator`,
            userFriendlyMessage: msg`Conditional display group operator is not valid`,
            value: logicalOperator,
          },
        ];
      }

      const visitedGroupIds = new Set<string>();
      let currentGroupId: string | null = recordFilterGroupId;

      while (isDefined(currentGroupId)) {
        if (visitedGroupIds.has(currentGroupId)) {
          return [
            {
              code: invalidDataCode,
              message: t`Conditional display group "${recordFilterGroupId}" is part of a cycle`,
              userFriendlyMessage: msg`Conditional display groups cannot form a cycle`,
              value: recordFilterGroupId,
            },
          ];
        }

        if (!parentGroupIdByGroupId.has(currentGroupId)) {
          return [
            {
              code: invalidDataCode,
              message: t`Conditional display group "${recordFilterGroupId}" references unknown parent group "${currentGroupId}"`,
              userFriendlyMessage: msg`Conditional display rule references a group that does not exist`,
              value: currentGroupId,
            },
          ];
        }

        visitedGroupIds.add(currentGroupId);
        currentGroupId = parentGroupIdByGroupId.get(currentGroupId) ?? null;
      }

      return [];
    },
  );
};

export const validateConditionalDisplay = ({
  conditionalDisplay,
  ...context
}: {
  conditionalDisplay: unknown;
} & ValidateConditionalDisplayContext): FlatEntityValidationError[] => {
  if (!isDefined(conditionalDisplay)) {
    return [];
  }

  const { surface, invalidDataCode } = context;

  const formatError: FlatEntityValidationError = {
    code: invalidDataCode,
    message: t`Conditional display on ${surface} must be a rule with record filters`,
    userFriendlyMessage: msg`Conditional display format is not supported`,
    value: conditionalDisplay,
  };

  if (
    !isPlainObject(conditionalDisplay) ||
    !isArray(conditionalDisplay.recordFilters) ||
    !conditionalDisplay.recordFilters.every(isPlainObject)
  ) {
    return [formatError];
  }

  const rawRecordFilterGroups = conditionalDisplay.recordFilterGroups ?? [];

  if (
    !isArray(rawRecordFilterGroups) ||
    !rawRecordFilterGroups.every(
      (recordFilterGroup) =>
        isPlainObject(recordFilterGroup) && isString(recordFilterGroup.id),
    )
  ) {
    return [formatError];
  }

  const {
    recordFilters = [],
    recordFilterGroups = [],
    quantifier,
  } = conditionalDisplay as UniversalConditionalDisplay;

  const errors: FlatEntityValidationError[] = [];

  if (isDefined(quantifier)) {
    if (surface !== 'commandMenuItem') {
      errors.push({
        code: invalidDataCode,
        message: t`Conditional display quantifier is only supported on command menu items`,
        userFriendlyMessage: msg`Conditional display quantifier is not available here`,
        value: quantifier,
      });
    } else if (
      !isString(quantifier) ||
      !['EVERY', 'SOME'].includes(quantifier)
    ) {
      errors.push({
        code: invalidDataCode,
        message: t`Conditional display quantifier "${quantifier}" is not supported`,
        userFriendlyMessage: msg`Conditional display quantifier is not valid`,
        value: quantifier,
      });
    }
  }

  errors.push(
    ...validateRecordFilterGroups({ recordFilterGroups, invalidDataCode }),
  );

  const recordFilterGroupIds = new Set(
    recordFilterGroups.map((recordFilterGroup) => recordFilterGroup.id),
  );

  errors.push(
    ...recordFilters.flatMap((recordFilter) =>
      validateRecordFilter({ recordFilter, recordFilterGroupIds, context }),
    ),
  );

  return errors;
};
