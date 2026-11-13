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

  const getOptionRowsOfField = ({
    optionRowByUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  }: {
    optionRowByUniversalIdentifier: Partial<Record<string, OptionRow>>;
    fieldMetadataUniversalIdentifier: string;
  }) =>
    Object.values(optionRowByUniversalIdentifier).filter(
      (optionRow): optionRow is OptionRow =>
        optionRow?.fieldMetadataUniversalIdentifier ===
        fieldMetadataUniversalIdentifier,
    );

  return new Map(
    [...touchedFieldMetadataUniversalIdentifiers].map(
      (fieldMetadataUniversalIdentifier) => [
        fieldMetadataUniversalIdentifier,
        {
          fromOptionRows: getOptionRowsOfField({
            optionRowByUniversalIdentifier: fromOptionRowByUniversalIdentifier,
            fieldMetadataUniversalIdentifier,
          }),
          toOptionRows: getOptionRowsOfField({
            optionRowByUniversalIdentifier: toOptionRowByUniversalIdentifier,
            fieldMetadataUniversalIdentifier,
          }),
          hasFieldAction: fieldMetadataUniversalIdentifiersWithFieldAction.has(
            fieldMetadataUniversalIdentifier,
          ),
        },
      ],
    ),
  );
};
