import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type FieldMetadataOptionRowForOptions } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-field-metadata-options-from-rows.util';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import {
  type FieldMetadataOptionEnumChange,
  type FieldMetadataOptionEnumChangeTracker,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/field-metadata-option-enum-change.type';

// One enum change per field, from its option rows before the migration to those after it.
export const buildFieldMetadataOptionEnumChangeTracker = ({
  actions,
  flatFieldMetadataOptionMaps,
}: {
  actions: AllUniversalWorkspaceMigrationAction[];
  flatFieldMetadataOptionMaps:
    | {
        byUniversalIdentifier: Partial<
          Record<
            string,
            FieldMetadataOptionRowForOptions &
              Pick<FlatFieldMetadataOption, 'fieldMetadataUniversalIdentifier'>
          >
        >;
      }
    | undefined;
}): FieldMetadataOptionEnumChangeTracker => {
  const optionRowsByFieldMetadataUniversalIdentifier = new Map<
    string,
    Map<string, FieldMetadataOptionRowForOptions>
  >();

  for (const flatFieldMetadataOption of Object.values(
    flatFieldMetadataOptionMaps?.byUniversalIdentifier ?? {},
  )) {
    if (!isDefined(flatFieldMetadataOption)) {
      continue;
    }

    const optionRows =
      optionRowsByFieldMetadataUniversalIdentifier.get(
        flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
      ) ?? new Map<string, FieldMetadataOptionRowForOptions>();

    optionRows.set(
      flatFieldMetadataOption.universalIdentifier,
      flatFieldMetadataOption,
    );
    optionRowsByFieldMetadataUniversalIdentifier.set(
      flatFieldMetadataOption.fieldMetadataUniversalIdentifier,
      optionRows,
    );
  }

  const enumChangeByFieldMetadataUniversalIdentifier = new Map<
    string,
    { fromOptionRows: FieldMetadataOptionRowForOptions[] }
  >();
  const fieldMetadataUniversalIdentifiersWithFieldAction = new Set<string>();

  const getOptionRowsToMutate = (fieldMetadataUniversalIdentifier: string) => {
    const optionRows =
      optionRowsByFieldMetadataUniversalIdentifier.get(
        fieldMetadataUniversalIdentifier,
      ) ?? new Map<string, FieldMetadataOptionRowForOptions>();

    optionRowsByFieldMetadataUniversalIdentifier.set(
      fieldMetadataUniversalIdentifier,
      optionRows,
    );

    if (
      !enumChangeByFieldMetadataUniversalIdentifier.has(
        fieldMetadataUniversalIdentifier,
      )
    ) {
      enumChangeByFieldMetadataUniversalIdentifier.set(
        fieldMetadataUniversalIdentifier,
        { fromOptionRows: [...optionRows.values()] },
      );
    }

    return optionRows;
  };

  for (const action of actions) {
    if (action.metadataName === 'objectMetadata' && action.type === 'create') {
      for (const {
        universalIdentifier,
      } of action.universalFlatFieldMetadatas) {
        fieldMetadataUniversalIdentifiersWithFieldAction.add(
          universalIdentifier,
        );
      }
      continue;
    }

    if (action.metadataName === 'fieldMetadata' && action.type !== 'delete') {
      fieldMetadataUniversalIdentifiersWithFieldAction.add(
        action.type === 'create'
          ? action.flatEntity.universalIdentifier
          : action.universalIdentifier,
      );
      continue;
    }

    if (action.metadataName !== 'fieldMetadataOption') {
      continue;
    }

    if (action.type === 'create') {
      getOptionRowsToMutate(
        action.flatEntity.fieldMetadataUniversalIdentifier,
      ).set(action.flatEntity.universalIdentifier, action.flatEntity);
      continue;
    }

    const existingFlatFieldMetadataOption =
      flatFieldMetadataOptionMaps?.byUniversalIdentifier[
        action.universalIdentifier
      ];

    if (!isDefined(existingFlatFieldMetadataOption)) {
      continue;
    }

    const optionRows = getOptionRowsToMutate(
      existingFlatFieldMetadataOption.fieldMetadataUniversalIdentifier,
    );

    if (action.type === 'delete') {
      optionRows.delete(action.universalIdentifier);
      continue;
    }

    const optionRow = optionRows.get(action.universalIdentifier);

    if (isDefined(optionRow)) {
      optionRows.set(action.universalIdentifier, {
        ...optionRow,
        ...action.update,
      });
    }
  }

  return {
    hasFieldAction: (fieldMetadataUniversalIdentifier) =>
      fieldMetadataUniversalIdentifiersWithFieldAction.has(
        fieldMetadataUniversalIdentifier,
      ),
    consume: (
      fieldMetadataUniversalIdentifier,
    ): FieldMetadataOptionEnumChange | undefined => {
      const enumChange = enumChangeByFieldMetadataUniversalIdentifier.get(
        fieldMetadataUniversalIdentifier,
      );

      if (!isDefined(enumChange)) {
        return undefined;
      }

      enumChangeByFieldMetadataUniversalIdentifier.delete(
        fieldMetadataUniversalIdentifier,
      );

      return {
        fromOptionRows: enumChange.fromOptionRows,
        toOptionRows: [
          ...(optionRowsByFieldMetadataUniversalIdentifier
            .get(fieldMetadataUniversalIdentifier)
            ?.values() ?? []),
        ],
      };
    },
  };
};
