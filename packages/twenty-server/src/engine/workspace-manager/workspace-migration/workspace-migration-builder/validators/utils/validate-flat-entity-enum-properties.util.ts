import { msg, t } from '@lingui/core/macro';
import { isDefined, isEnumValue } from 'twenty-shared/utils';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type FlatEntityEnumPropertyRule<TEnumValue extends string = string> = {
  enumObject: Record<string, TEnumValue>;
  isNullable?: boolean;
};

export type FlatEntityEnumPropertyRules<TFlatEntity> = {
  [TProperty in keyof TFlatEntity]?: FlatEntityEnumPropertyRule<
    Extract<TFlatEntity[TProperty], string>
  >;
};

// Undefined properties are skipped: they are either absent from an update or
// left to the column default on creation
export const validateFlatEntityEnumProperties = <TFlatEntity extends object>({
  flatEntity,
  enumPropertyRules,
  code,
}: {
  flatEntity: TFlatEntity;
  enumPropertyRules: NoInfer<FlatEntityEnumPropertyRules<TFlatEntity>>;
  code: string;
}): FlatEntityValidationError[] =>
  Object.entries<FlatEntityEnumPropertyRule | undefined>(
    enumPropertyRules,
  ).flatMap(([property, rule]) => {
    if (!isDefined(rule)) {
      return [];
    }

    const value: unknown = flatEntity[property as keyof TFlatEntity];

    if (
      value === undefined ||
      (value === null && rule.isNullable === true) ||
      isEnumValue(rule.enumObject, value)
    ) {
      return [];
    }

    const stringifiedValue = JSON.stringify(value);
    const expectedValues = Object.values(rule.enumObject).join(', ');

    return [
      {
        code,
        message: t`Invalid value ${stringifiedValue} for ${property}, expected one of: ${expectedValues}`,
        userFriendlyMessage: msg`Invalid value ${stringifiedValue} for ${property}`,
        value,
      },
    ];
  });
