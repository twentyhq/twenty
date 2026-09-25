import { isNull } from '@sniptt/guards';
import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { fromUpdateViewInputToFlatViewToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util';
import { resolveEffectiveUniversalFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity.util';
import { type UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';

const APPLICATION_UNIVERSAL_IDENTIFIER = '20202020-aaaa-4aaa-8aaa-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-bbbb-4bbb-8bbb-000000000002';
const VIEW_ID = '20202020-cccc-4ccc-8ccc-000000000003';
const COMPANY_FIELD_ID = '20202020-dddd-4ddd-8ddd-000000000004';
const STAGE_FIELD_ID = '20202020-eeee-4eee-8eee-000000000005';
const OBJECT_METADATA_ID = '20202020-ffff-4fff-8fff-000000000006';

const stageOptions = Array.from({ length: 14 }, (_, position) => ({
  value: `STAGE_${position}`,
  label: `Stage ${position}`,
  position,
  color: 'blue',
}));

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: STAGE_FIELD_ID,
    universalIdentifier: STAGE_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    type: FieldMetadataType.SELECT,
    isNullable: false,
    options: stageOptions,
  }),
  getFlatFieldMetadataMock({
    id: COMPANY_FIELD_ID,
    universalIdentifier: COMPANY_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    type: FieldMetadataType.RELATION,
    isNullable: true,
  }),
].reduce<FlatEntityMaps<FlatFieldMetadata>>(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps(),
);

const existingViewGroup: FlatViewGroup = {
  id: '20202020-aaaa-4aaa-8aaa-000000000007',
  universalIdentifier: '20202020-aaaa-4aaa-8aaa-000000000008',
  viewId: VIEW_ID,
  viewUniversalIdentifier: VIEW_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  applicationId: APPLICATION_UNIVERSAL_IDENTIFIER,
  workspaceId: WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  createdAt: '2026-09-25T00:00:00.000Z',
  updatedAt: '2026-09-25T00:00:00.000Z',
  deletedAt: null,
  fieldValue: '',
  isVisible: false,
  position: 3,
};

const updateView = ({
  groupingOverride,
  updateViewInput,
}: {
  groupingOverride: string | null;
  updateViewInput: Omit<UpdateViewInput, 'id'>;
}) => {
  const existingViewGroups = isNull(groupingOverride)
    ? []
    : [existingViewGroup];
  const existingView: FlatView = {
    id: VIEW_ID,
    universalIdentifier: VIEW_ID,
    name: 'By Stage',
    type: ViewType.KANBAN,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    applicationId: APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceId: WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataId: OBJECT_METADATA_ID,
    objectMetadataUniversalIdentifier: OBJECT_METADATA_ID,
    icon: 'IconKanban',
    key: null,
    position: 0,
    isCompact: false,
    isCustom: false,
    isActive: true,
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    createdAt: existingViewGroup.createdAt,
    updatedAt: existingViewGroup.updatedAt,
    deletedAt: null,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataId: null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
    calendarLayout: null,
    calendarFieldMetadataId: null,
    calendarFieldMetadataUniversalIdentifier: null,
    calendarEndFieldMetadataId: null,
    calendarEndFieldMetadataUniversalIdentifier: null,
    anyFieldFilterValue: null,
    shouldHideEmptyGroups: false,
    kanbanColumnWidth: null,
    groupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
    isSystemSideEffect: false,
    mainGroupByFieldMetadataId: STAGE_FIELD_ID,
    mainGroupByFieldMetadataUniversalIdentifier: STAGE_FIELD_ID,
    overrides: {
      [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
        mainGroupByFieldMetadataId: groupingOverride,
        type: isNull(groupingOverride) ? ViewType.TABLE : ViewType.KANBAN,
      },
    },
    universalOverrides: null,
    viewGroupIds: existingViewGroups.map(({ id }) => id),
    viewGroupUniversalIdentifiers: existingViewGroups.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewFieldIds: [],
    viewFieldUniversalIdentifiers: [],
    viewFieldGroupIds: [],
    viewFieldGroupUniversalIdentifiers: [],
    viewFilterIds: [],
    viewFilterUniversalIdentifiers: [],
    viewFilterGroupIds: [],
    viewFilterGroupUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    navigationMenuItemIds: [],
    navigationMenuItemUniversalIdentifiers: [],
  };

  return fromUpdateViewInputToFlatViewToUpdateOrThrow({
    updateViewInput: { id: VIEW_ID, ...updateViewInput },
    flatViewMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: existingView,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    flatViewGroupMaps: existingViewGroups.reduce<FlatEntityMaps<FlatViewGroup>>(
      (flatEntityMaps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
      createEmptyFlatEntityMaps(),
    ),
    flatFieldMetadataMaps,
    callerApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  });
};

describe('fromUpdateViewInputToFlatViewToUpdateOrThrow', () => {
  it.each([COMPANY_FIELD_ID, null])(
    'recreates stage groups when restoring the base grouping from %s',
    (groupingOverride) => {
      const { flatViewGroupsToCreate, flatViewGroupsToDelete } = updateView({
        groupingOverride,
        updateViewInput: {
          mainGroupByFieldMetadataId: STAGE_FIELD_ID,
          type: ViewType.KANBAN,
        },
      });

      expect(flatViewGroupsToDelete).toEqual(
        isNull(groupingOverride) ? [] : [existingViewGroup],
      );
      expect(
        flatViewGroupsToCreate.map(({ fieldValue }) => fieldValue),
      ).toEqual(stageOptions.map(({ value }) => value));
    },
  );

  it.each([
    { name: 'Renamed view' },
    { mainGroupByFieldMetadataId: COMPANY_FIELD_ID },
  ])(
    'preserves groups when effective grouping is unchanged: %j',
    (updateViewInput) => {
      const result = updateView({
        groupingOverride: COMPANY_FIELD_ID,
        updateViewInput,
      });

      expect(result.flatViewGroupsToDelete).toEqual([]);
      expect(result.flatViewGroupsToCreate).toEqual([]);
      expect(
        result.flatViewToUpdate.mainGroupByFieldMetadataUniversalIdentifier,
      ).toBe(STAGE_FIELD_ID);
      expect(
        resolveEffectiveUniversalFlatEntity({
          metadataName: 'view',
          universalFlatEntity: result.flatViewToUpdate,
        }).mainGroupByFieldMetadataUniversalIdentifier,
      ).toBe(COMPANY_FIELD_ID);
    },
  );

  it('removes groups when clearing an overridden grouping', () => {
    const result = updateView({
      groupingOverride: COMPANY_FIELD_ID,
      updateViewInput: {
        mainGroupByFieldMetadataId: null,
        type: ViewType.TABLE,
      },
    });

    expect(result.flatViewGroupsToDelete).toEqual([existingViewGroup]);
    expect(result.flatViewGroupsToCreate).toEqual([]);
  });
});
