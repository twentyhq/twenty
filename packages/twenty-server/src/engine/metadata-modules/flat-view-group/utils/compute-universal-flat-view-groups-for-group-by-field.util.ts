import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

type ComputeUniversalFlatViewGroupsForGroupByFieldArgs = {
  viewUniversalIdentifier: string;
  mainGroupByFlatFieldMetadata: Pick<
    UniversalFlatFieldMetadata,
    'options' | 'isNullable'
  >;
  applicationUniversalIdentifier: string;
  generateUniversalIdentifier: (args: { fieldValue: string }) => string;
  now: string;
};

// Single source of truth for deriving a grouped view's view groups from its
// group-by field: one group per select option in option order, plus a trailing
// empty-value group when the field is nullable.
export const computeUniversalFlatViewGroupsForGroupByField = ({
  viewUniversalIdentifier,
  mainGroupByFlatFieldMetadata,
  applicationUniversalIdentifier,
  generateUniversalIdentifier,
  now,
}: ComputeUniversalFlatViewGroupsForGroupByFieldArgs): UniversalFlatViewGroup[] => {
  const buildUniversalFlatViewGroup = ({
    fieldValue,
    position,
  }: {
    fieldValue: string;
    position: number;
  }): UniversalFlatViewGroup => ({
    universalIdentifier: generateUniversalIdentifier({ fieldValue }),
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    fieldValue,
    isVisible: position < VIEW_GROUP_VISIBLE_OPTIONS_MAX,
    position,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });

  const universalFlatViewGroups = (
    mainGroupByFlatFieldMetadata.options ?? []
  ).map((option, index) =>
    buildUniversalFlatViewGroup({
      fieldValue: option.value,
      position: index,
    }),
  );

  if (mainGroupByFlatFieldMetadata.isNullable === true) {
    universalFlatViewGroups.push(
      buildUniversalFlatViewGroup({
        fieldValue: '',
        position: universalFlatViewGroups.length,
      }),
    );
  }

  return universalFlatViewGroups;
};
