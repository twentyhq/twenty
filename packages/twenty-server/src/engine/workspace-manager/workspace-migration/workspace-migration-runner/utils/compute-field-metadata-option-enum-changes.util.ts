import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type FieldMetadataOptionRowForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import { type FieldMetadataOptionEnumChangeOfMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';

type OptionRow = FieldMetadataOptionRowForOptions &
  Pick<FlatFieldMetadataOption, 'fieldMetadataUniversalIdentifier'>;

export const computeFieldMetadataOptionEnumChanges = ({
  actions,
  flatFieldMetadataOptionMaps,
}: {
  actions: AllUniversalWorkspaceMigrationAction[];
  flatFieldMetadataOptionMaps:
    | { byUniversalIdentifier: Partial<Record<string, OptionRow>> }
    | undefined;
}): Map<string, FieldMetadataOptionEnumChangeOfMigration> => {
  const fromOptionRowByUniversalIdentifier =
    flatFieldMetadataOptionMaps?.byUniversalIdentifier ?? {};
  const toOptionRowByUniversalIdentifier = {
    ...fromOptionRowByUniversalIdentifier,
  };
  const touchedFieldMetadataUniversalIdentifiers = new Set<string>();
  const fieldMetadataUniversalIdentifiersWithFieldAction = new Set<string>();

  for (const action of actions) {
    if (action.metadataName === 'objectMetadata' && action.type === 'create') {
      action.universalFlatFieldMetadatas.forEach(({ universalIdentifier }) =>
        fieldMetadataUniversalIdentifiersWithFieldAction.add(
          universalIdentifier,
        ),
      );
    } else if (
      action.metadataName === 'fieldMetadata' &&
      action.type !== 'delete'
    ) {
      fieldMetadataUniversalIdentifiersWithFieldAction.add(
        action.type === 'create'
          ? action.flatEntity.universalIdentifier
          : action.universalIdentifier,
      );
    } else if (
      action.metadataName === 'fieldMetadataOption' &&
      action.type === 'create'
    ) {
      toOptionRowByUniversalIdentifier[action.flatEntity.universalIdentifier] =
        action.flatEntity;
      touchedFieldMetadataUniversalIdentifiers.add(
        action.flatEntity.fieldMetadataUniversalIdentifier,
      );
    } else if (action.metadataName === 'fieldMetadataOption') {
      const optionRow =
        toOptionRowByUniversalIdentifier[action.universalIdentifier];

      if (!isDefined(optionRow)) {
        continue;
      }

      touchedFieldMetadataUniversalIdentifiers.add(
        optionRow.fieldMetadataUniversalIdentifier,
      );
      toOptionRowByUniversalIdentifier[action.universalIdentifier] =
        action.type === 'delete'
          ? undefined
          : { ...optionRow, ...action.update };
    }
  }

  const groupTouchedFieldOptionRows = (
    optionRowByUniversalIdentifier: Partial<Record<string, OptionRow>>,
  ) => {
    const optionRowsByFieldMetadataUniversalIdentifier = new Map<
      string,
      OptionRow[]
    >();

    for (const optionRow of Object.values(optionRowByUniversalIdentifier)) {
      if (
        !isDefined(optionRow) ||
        !touchedFieldMetadataUniversalIdentifiers.has(
          optionRow.fieldMetadataUniversalIdentifier,
        )
      ) {
        continue;
      }

      const optionRowsOfField =
        optionRowsByFieldMetadataUniversalIdentifier.get(
          optionRow.fieldMetadataUniversalIdentifier,
        ) ?? [];

      optionRowsOfField.push(optionRow);
      optionRowsByFieldMetadataUniversalIdentifier.set(
        optionRow.fieldMetadataUniversalIdentifier,
        optionRowsOfField,
      );
    }

    return optionRowsByFieldMetadataUniversalIdentifier;
  };

  const fromOptionRowsByFieldMetadataUniversalIdentifier =
    groupTouchedFieldOptionRows(fromOptionRowByUniversalIdentifier);
  const toOptionRowsByFieldMetadataUniversalIdentifier =
    groupTouchedFieldOptionRows(toOptionRowByUniversalIdentifier);

  return new Map(
    [...touchedFieldMetadataUniversalIdentifiers].map(
      (fieldMetadataUniversalIdentifier) => [
        fieldMetadataUniversalIdentifier,
        {
          fromOptionRows:
            fromOptionRowsByFieldMetadataUniversalIdentifier.get(
              fieldMetadataUniversalIdentifier,
            ) ?? [],
          toOptionRows:
            toOptionRowsByFieldMetadataUniversalIdentifier.get(
              fieldMetadataUniversalIdentifier,
            ) ?? [],
          hasFieldAction: fieldMetadataUniversalIdentifiersWithFieldAction.has(
            fieldMetadataUniversalIdentifier,
          ),
        },
      ],
    ),
  );
};
