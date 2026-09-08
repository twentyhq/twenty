import { type EnumFieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-view-groups-on-flat-field-metadata-options-update.util';
import { type FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';

const WORKSPACE_ID = 'workspace-1';
const FIELD_METADATA_ID = 'field-1';
const VIEW_ID = 'view-db-id-1';
const VIEW_UNIVERSAL_IDENTIFIER = 'view-uid-1';

type OptionInput = { id: string; value: string };

const buildOptions = (
  options: OptionInput[],
): FlatFieldMetadata<EnumFieldMetadataType>['options'] =>
  options.map((option, index) => ({
    id: option.id,
    value: option.value,
    label: option.value,
    color: 'blue',
    position: index,
  }));

const buildFlatFieldMetadata = ({
  options,
}: {
  options: OptionInput[];
}): FlatFieldMetadata<EnumFieldMetadataType> =>
  ({
    id: FIELD_METADATA_ID,
    workspaceId: WORKSPACE_ID,
    options: buildOptions(options),
    mainGroupByFieldMetadataViewIds: [VIEW_ID],
    applicationId: null,
    applicationUniversalIdentifier: null,
  }) as unknown as FlatFieldMetadata<EnumFieldMetadataType>;

const buildFlatViewMaps = (viewGroupIds: string[]): FlatViewMaps =>
  ({
    byUniversalIdentifier: {
      [VIEW_UNIVERSAL_IDENTIFIER]: {
        id: VIEW_ID,
        universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
        viewGroupIds,
        mainGroupByFieldMetadataId: FIELD_METADATA_ID,
      },
    },
    universalIdentifierById: { [VIEW_ID]: VIEW_UNIVERSAL_IDENTIFIER },
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatViewMaps;

const buildFlatViewGroupMaps = (
  viewGroups: { id: string; fieldValue: string; position: number }[],
): FlatViewGroupMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      viewGroups.map((viewGroup) => [
        viewGroup.id,
        {
          ...viewGroup,
          universalIdentifier: viewGroup.id,
          viewId: VIEW_ID,
          viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
          isVisible: true,
        },
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      viewGroups.map((viewGroup) => [viewGroup.id, viewGroup.id]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatViewGroupMaps;

describe('recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate', () => {
  it('should create a view group for each new option when every existing option was replaced', () => {
    const fromFlatFieldMetadata = buildFlatFieldMetadata({
      options: [
        { id: 'option-a', value: 'A' },
        { id: 'option-b', value: 'B' },
      ],
    });

    const { flatViewGroupsToCreate, flatViewGroupsToDelete } =
      recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate({
        fromFlatFieldMetadata,
        toOptions: buildOptions([
          { id: 'option-c', value: 'C' },
          { id: 'option-d', value: 'D' },
        ]),
        flatViewMaps: buildFlatViewMaps(['group-a', 'group-b']),
        flatViewGroupMaps: buildFlatViewGroupMaps([
          { id: 'group-a', fieldValue: 'A', position: 0 },
          { id: 'group-b', fieldValue: 'B', position: 1 },
        ]),
      });

    expect(flatViewGroupsToDelete.map(({ fieldValue }) => fieldValue)).toEqual([
      'A',
      'B',
    ]);
    expect(
      flatViewGroupsToCreate.map(({ fieldValue, position, viewId }) => ({
        fieldValue,
        position,
        viewId,
      })),
    ).toEqual([
      { fieldValue: 'C', position: 0, viewId: VIEW_ID },
      { fieldValue: 'D', position: 1, viewId: VIEW_ID },
    ]);
  });

  it('should position new view groups after the highest remaining one', () => {
    const fromFlatFieldMetadata = buildFlatFieldMetadata({
      options: [
        { id: 'option-a', value: 'A' },
        { id: 'option-b', value: 'B' },
      ],
    });

    const { flatViewGroupsToCreate } =
      recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate({
        fromFlatFieldMetadata,
        toOptions: buildOptions([
          { id: 'option-a', value: 'A' },
          { id: 'option-c', value: 'C' },
        ]),
        flatViewMaps: buildFlatViewMaps(['group-a', 'group-b']),
        flatViewGroupMaps: buildFlatViewGroupMaps([
          { id: 'group-a', fieldValue: 'A', position: 0 },
          { id: 'group-b', fieldValue: 'B', position: 1 },
        ]),
      });

    expect(
      flatViewGroupsToCreate.map(({ fieldValue, position }) => ({
        fieldValue,
        position,
      })),
    ).toEqual([{ fieldValue: 'C', position: 1 }]);
  });

  it('should repopulate a grouped view that has no view group left', () => {
    const fromFlatFieldMetadata = buildFlatFieldMetadata({ options: [] });

    const { flatViewGroupsToCreate } =
      recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate({
        fromFlatFieldMetadata,
        toOptions: buildOptions([{ id: 'option-a', value: 'A' }]),
        flatViewMaps: buildFlatViewMaps([]),
        flatViewGroupMaps: buildFlatViewGroupMaps([]),
      });

    expect(
      flatViewGroupsToCreate.map(({ fieldValue, position }) => ({
        fieldValue,
        position,
      })),
    ).toEqual([{ fieldValue: 'A', position: 0 }]);
  });

  it('should do nothing when the field groups no view', () => {
    const fromFlatFieldMetadata = {
      ...buildFlatFieldMetadata({ options: [{ id: 'option-a', value: 'A' }] }),
      mainGroupByFieldMetadataViewIds: [],
    };

    expect(
      recomputeViewGroupsOnFlatFieldMetadataOptionsUpdate({
        fromFlatFieldMetadata,
        toOptions: buildOptions([{ id: 'option-b', value: 'B' }]),
        flatViewMaps: buildFlatViewMaps([]),
        flatViewGroupMaps: buildFlatViewGroupMaps([]),
      }),
    ).toEqual({
      flatViewGroupsToCreate: [],
      flatViewGroupsToDelete: [],
      flatViewGroupsToUpdate: [],
    });
  });
});
