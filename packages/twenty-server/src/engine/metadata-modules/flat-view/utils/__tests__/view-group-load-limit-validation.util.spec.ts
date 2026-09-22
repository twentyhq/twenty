import {
  DEFAULT_VIEW_GROUP_LOAD_LIMIT,
  VIEW_GROUP_LOAD_LIMIT_OPTIONS,
} from 'twenty-shared/constants';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { fromUpdateViewInputToFlatViewToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';

const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000001';
const OBJECT_METADATA_ID = '00000000-0000-4000-8000-000000000002';
const OBJECT_METADATA_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000003';
const VIEW_ID = '00000000-0000-4000-8000-000000000004';
const VIEW_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000005';
const WORKSPACE_ID = '00000000-0000-4000-8000-000000000006';
const APPLICATION_ID = '00000000-0000-4000-8000-000000000007';

const REJECTED_GROUP_LOAD_LIMITS = [0, -1, 7, 1000];

const flatApplication = {
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
} as FlatApplication;

const flatFieldMetadataMaps =
  createEmptyFlatEntityMaps() as AllFlatEntityMaps['flatFieldMetadataMaps'];

const flatObjectMetadataMaps = {
  ...createEmptyFlatEntityMaps(),
  universalIdentifierById: {
    [OBJECT_METADATA_ID]: OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
  },
} as AllFlatEntityMaps['flatObjectMetadataMaps'];

const existingFlatView: FlatView = {
  id: VIEW_ID,
  universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
  workspaceId: WORKSPACE_ID,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectMetadataId: OBJECT_METADATA_ID,
  name: 'People',
  icon: 'IconUser',
  type: ViewType.TABLE,
  key: null,
  position: 0,
  isCompact: false,
  isCustom: true,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataId: null,
  calendarLayout: null,
  calendarFieldMetadataId: null,
  calendarEndFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  shouldHideEmptyGroups: false,
  kanbanColumnWidth: null,
  groupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
  anyFieldFilterValue: null,
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
  isSystemSideEffect: false,
  createdByUserWorkspaceId: null,
  overrides: null,
  createdAt: '2026-09-22T00:00:00.000Z',
  updatedAt: '2026-09-22T00:00:00.000Z',
  deletedAt: null,
  viewFieldIds: [],
  viewFieldGroupIds: [],
  viewFilterIds: [],
  viewFilterGroupIds: [],
  viewSortIds: [],
  viewGroupIds: [],
  navigationMenuItemIds: [],
  viewFieldUniversalIdentifiers: [],
  viewFieldGroupUniversalIdentifiers: [],
  viewFilterUniversalIdentifiers: [],
  viewFilterGroupUniversalIdentifiers: [],
  viewSortUniversalIdentifiers: [],
  viewGroupUniversalIdentifiers: [],
  navigationMenuItemUniversalIdentifiers: [],
  objectMetadataUniversalIdentifier: OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
  calendarFieldMetadataUniversalIdentifier: null,
  calendarEndFieldMetadataUniversalIdentifier: null,
  mainGroupByFieldMetadataUniversalIdentifier: null,
  universalOverrides: null,
};

const flatViewMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: existingFlatView,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatViewGroupMaps =
  createEmptyFlatEntityMaps() as AllFlatEntityMaps['flatViewGroupMaps'];

const createViewWithGroupLoadLimit = (groupLoadLimit?: number) =>
  fromCreateViewInputToFlatViewToCreate({
    createViewInput: {
      name: 'People',
      icon: 'IconUser',
      objectMetadataId: OBJECT_METADATA_ID,
      groupLoadLimit,
    },
    flatApplication,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

const updateViewWithGroupLoadLimit = (groupLoadLimit: number) =>
  fromUpdateViewInputToFlatViewToUpdateOrThrow({
    updateViewInput: { id: VIEW_ID, groupLoadLimit },
    flatViewMaps,
    flatViewGroupMaps,
    flatFieldMetadataMaps,
    callerApplicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    workspaceCustomApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
  });

describe('view groupLoadLimit allowlist enforcement', () => {
  describe('fromCreateViewInputToFlatViewToCreate', () => {
    it.each(VIEW_GROUP_LOAD_LIMIT_OPTIONS)(
      'accepts the allowed group load limit %s',
      (groupLoadLimit) => {
        const { flatViewToCreate } =
          createViewWithGroupLoadLimit(groupLoadLimit);

        expect(flatViewToCreate.groupLoadLimit).toBe(groupLoadLimit);
      },
    );

    it('falls back to the default group load limit when none is provided', () => {
      const { flatViewToCreate } = createViewWithGroupLoadLimit();

      expect(flatViewToCreate.groupLoadLimit).toBe(
        DEFAULT_VIEW_GROUP_LOAD_LIMIT,
      );
    });

    it.each(REJECTED_GROUP_LOAD_LIMITS)(
      'rejects the group load limit %s',
      (groupLoadLimit) => {
        expect(() => createViewWithGroupLoadLimit(groupLoadLimit)).toThrow(
          expect.objectContaining({
            code: ViewExceptionCode.INVALID_VIEW_DATA,
            message: expect.stringContaining(
              `Unsupported groupLoadLimit ${groupLoadLimit}`,
            ),
          }),
        );
      },
    );
  });

  describe('fromUpdateViewInputToFlatViewToUpdateOrThrow', () => {
    it.each(VIEW_GROUP_LOAD_LIMIT_OPTIONS)(
      'accepts the allowed group load limit %s',
      (groupLoadLimit) => {
        const { flatViewToUpdate } =
          updateViewWithGroupLoadLimit(groupLoadLimit);

        expect(flatViewToUpdate.groupLoadLimit).toBe(groupLoadLimit);
      },
    );

    it.each(REJECTED_GROUP_LOAD_LIMITS)(
      'rejects the group load limit %s',
      (groupLoadLimit) => {
        expect(() => updateViewWithGroupLoadLimit(groupLoadLimit)).toThrow(
          expect.objectContaining({
            code: ViewExceptionCode.INVALID_VIEW_DATA,
            message: expect.stringContaining(
              `Unsupported groupLoadLimit ${groupLoadLimit}`,
            ),
          }),
        );
      },
    );
  });
});
