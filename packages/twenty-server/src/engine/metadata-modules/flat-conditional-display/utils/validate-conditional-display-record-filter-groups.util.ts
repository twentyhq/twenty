import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalConditionalDisplayRecordFilterGroup } from 'src/engine/metadata-modules/flat-conditional-display/types/universal-conditional-display-record-filter-group.type';
import { isRecordFilterGroupLogicalOperator } from 'src/engine/metadata-modules/flat-conditional-display/utils/is-record-filter-group-logical-operator.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplayRecordFilterGroups = ({
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
