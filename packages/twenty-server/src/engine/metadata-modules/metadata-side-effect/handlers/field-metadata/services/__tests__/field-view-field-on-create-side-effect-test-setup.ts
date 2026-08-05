import {
  getFieldUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey, ViewType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type BuildSideEffectsArgs } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
export const OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000001';

export const computeFieldUniversalIdentifier = (name: string) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    name,
  });

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  computeFieldUniversalIdentifier('name');
export const PRIORITY_FIELD_UNIVERSAL_IDENTIFIER =
  computeFieldUniversalIdentifier('priority');

export const DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.INDEX,
  });

export const DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.FIELDS_WIDGET,
  });

export const computeViewFieldUniversalIdentifier = ({
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
}: {
  viewUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
}) =>
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
  });

export type PendingFieldMetadata = {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  name: string;
  type: FieldMetadataType;
  isSystemSideEffect: boolean;
};

export const buildPendingFieldMetadata = (
  name: string,
  type: FieldMetadataType = FieldMetadataType.TEXT,
  isSystemSideEffect = false,
): PendingFieldMetadata => ({
  universalIdentifier: computeFieldUniversalIdentifier(name),
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  name,
  type,
  isSystemSideEffect,
});

export const NAME_FIELD = buildPendingFieldMetadata('name');
export const PRIORITY_FIELD = buildPendingFieldMetadata(
  'priority',
  FieldMetadataType.NUMBER,
);

export const OBJECT_METADATA = {
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'ticket',
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
};

export type WorkspaceView = {
  id: string;
  universalIdentifier: string;
  key: ViewKey | null;
  type?: ViewType;
  isActive?: boolean;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
  objectMetadataUniversalIdentifier?: string;
  viewFieldGroupUniversalIdentifiers?: string[];
};

export type WorkspaceViewField = {
  universalIdentifier: string;
  viewId: string;
  viewUniversalIdentifier?: string;
  fieldMetadataUniversalIdentifier?: string;
  viewFieldGroupUniversalIdentifier?: string | null;
  position: number;
  isActive: boolean;
  deletedAt?: string | null;
};

export type WorkspaceFieldsWidget = {
  universalIdentifier: string;
  isActive?: boolean;
  deletedAt?: string | null;
  universalConfiguration: {
    configurationType: string;
    viewUniversalIdentifier?: string | null;
    newFieldDefaultVisibility?: boolean | null;
  };
};

export type WorkspaceViewFieldGroup = {
  universalIdentifier: string;
  position: number;
  isActive?: boolean;
  deletedAt?: string | null;
};

export const buildArgs = ({
  triggerFieldMetadata,
  pendingFieldMetadatas = [],
  objectMetadataCreatedInBatch = false,
  pendingViews = [],
  pendingViewFields = [],
  objectMetadataInWorkspace = false,
  viewsInWorkspace = [],
  viewFieldsInWorkspace = [],
  fieldsWidgetsInWorkspace = [],
  viewFieldGroupsInWorkspace = [],
}: {
  triggerFieldMetadata: PendingFieldMetadata;
  pendingFieldMetadatas?: PendingFieldMetadata[];
  objectMetadataCreatedInBatch?: boolean;
  pendingViews?: {
    universalIdentifier: string;
    isSystemSideEffect: boolean;
    type?: ViewType;
    objectMetadataUniversalIdentifier?: string;
  }[];
  pendingViewFields?: {
    universalIdentifier: string;
    viewUniversalIdentifier: string;
    fieldMetadataUniversalIdentifier: string;
  }[];
  objectMetadataInWorkspace?: boolean;
  viewsInWorkspace?: WorkspaceView[];
  viewFieldsInWorkspace?: WorkspaceViewField[];
  fieldsWidgetsInWorkspace?: WorkspaceFieldsWidget[];
  viewFieldGroupsInWorkspace?: WorkspaceViewFieldGroup[];
}): BuildSideEffectsArgs<'fieldMetadata'> =>
  ({
    flatEntity: triggerFieldMetadata,
    allFlatEntityOperationRecordByMetadataName: {
      fieldMetadata: {
        flatEntityToCreate: Object.fromEntries(
          pendingFieldMetadatas.map((pendingFieldMetadata) => [
            pendingFieldMetadata.universalIdentifier,
            pendingFieldMetadata,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      objectMetadata: {
        flatEntityToCreate: objectMetadataCreatedInBatch
          ? { [OBJECT_UNIVERSAL_IDENTIFIER]: OBJECT_METADATA }
          : {},
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      view: {
        flatEntityToCreate: Object.fromEntries(
          pendingViews.map((pendingView) => [
            pendingView.universalIdentifier,
            pendingView,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
      viewField: {
        flatEntityToCreate: Object.fromEntries(
          pendingViewFields.map((pendingViewField) => [
            pendingViewField.universalIdentifier,
            pendingViewField,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: {
      flatObjectMetadataMaps: {
        byUniversalIdentifier: objectMetadataInWorkspace
          ? { [OBJECT_UNIVERSAL_IDENTIFIER]: OBJECT_METADATA }
          : {},
      },
      flatViewMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewsInWorkspace.map((view) => [
            view.universalIdentifier,
            {
              isActive: true,
              deletedAt: null,
              isSystemSideEffect: false,
              objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
              viewFieldGroupUniversalIdentifiers: [],
              ...view,
              // Mirrors fromViewEntityToFlatView: the view aggregates the
              // view fields pointing at it.
              viewFieldUniversalIdentifiers: viewFieldsInWorkspace
                .filter((viewField) => viewField.viewId === view.id)
                .map((viewField) => viewField.universalIdentifier),
            },
          ]),
        ),
      },
      flatViewFieldMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewFieldsInWorkspace.map((viewField) => [
            viewField.universalIdentifier,
            { viewFieldGroupUniversalIdentifier: null, ...viewField },
          ]),
        ),
      },
      flatViewFieldGroupMaps: {
        byUniversalIdentifier: Object.fromEntries(
          viewFieldGroupsInWorkspace.map((viewFieldGroup) => [
            viewFieldGroup.universalIdentifier,
            { isActive: true, deletedAt: null, ...viewFieldGroup },
          ]),
        ),
      },
      flatPageLayoutWidgetMaps: {
        byUniversalIdentifier: Object.fromEntries(
          fieldsWidgetsInWorkspace.map((fieldsWidget) => [
            fieldsWidget.universalIdentifier,
            { isActive: true, deletedAt: null, ...fieldsWidget },
          ]),
        ),
      },
    },
    context: {},
  }) as unknown as BuildSideEffectsArgs<'fieldMetadata'>;

// Synced INDEX view: the 2-26 reconcile command re-owns every INDEX view to the
// derived identifier, so the handler resolves it by that identifier alone.
export const SYNCED_INDEX_VIEW: WorkspaceView = {
  id: 'view-db-id-1',
  universalIdentifier: DERIVED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  key: ViewKey.INDEX,
  isSystemSideEffect: true,
};

export const SYNCED_RECORD_PAGE_VIEW: WorkspaceView = {
  id: 'view-db-id-2',
  universalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  key: ViewKey.FIELDS_WIDGET,
  type: ViewType.FIELDS_WIDGET,
  isSystemSideEffect: true,
};

export const SYNCED_FIELDS_WIDGET: WorkspaceFieldsWidget = {
  universalIdentifier: 'widget-uid-1',
  universalConfiguration: {
    configurationType: 'FIELDS',
    viewUniversalIdentifier: DERIVED_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
    newFieldDefaultVisibility: true,
  },
};

export const filterByView = <T extends { viewUniversalIdentifier: string }>(
  viewFields: T[],
  viewUniversalIdentifier: string,
): T[] =>
  viewFields.filter(
    (viewField) =>
      viewField.viewUniversalIdentifier === viewUniversalIdentifier,
  );
