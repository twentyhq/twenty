import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeInitialObjectViewFieldForExistingObject = ({
  sourceFlatFieldMetadata,
  flatObjectMetadata,
  allFlatEntityOperationRecordByMetadataName,
  flatViewMaps,
  flatViewFieldMaps,
}: {
  sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
  flatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    | 'universalIdentifier'
    | 'viewUniversalIdentifiers'
    | 'labelIdentifierFieldMetadataUniversalIdentifier'
  >;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
} & Pick<AllFlatEntityMaps, 'flatViewMaps' | 'flatViewFieldMaps'>):
  | UniversalFlatViewField
  | undefined => {
  const { applicationUniversalIdentifier } = sourceFlatFieldMetadata;
  const { labelIdentifierFieldMetadataUniversalIdentifier } =
    flatObjectMetadata;

  if (
    sourceFlatFieldMetadata.universalIdentifier ===
    labelIdentifierFieldMetadataUniversalIdentifier
  ) {
    return undefined;
  }

  // The initial view is keyed on its own application, which differs per workspace.
  const initialFlatView = flatObjectMetadata.viewUniversalIdentifiers
    .map(
      (viewUniversalIdentifier) =>
        flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier],
    )
    .filter(isDefined)
    .find(
      (flatView) =>
        !isDefined(flatView.deletedAt) &&
        flatView.universalIdentifier ===
          getInitialObjectViewUniversalIdentifier({
            viewApplicationUniversalIdentifier:
              flatView.applicationUniversalIdentifier,
            objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
          }),
    );

  if (
    !isDefined(initialFlatView) ||
    initialFlatView.applicationUniversalIdentifier ===
      applicationUniversalIdentifier
  ) {
    return undefined;
  }

  const appendBasePosition =
    initialFlatView.viewFieldUniversalIdentifiers
      .map(
        (viewFieldUniversalIdentifier) =>
          flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier],
      )
      .filter(isDefined)
      .filter(
        (flatViewField) =>
          resolveEffectiveUniversalFlatEntityProperty({
            metadataName: 'viewField',
            universalFlatEntity: flatViewField,
            property: 'isActive',
          }) && !isDefined(flatViewField.deletedAt),
      )
      .reduce(
        (maxPosition, flatViewField) =>
          Math.max(maxPosition, flatViewField.position),
        -1,
      ) + 1;

  const indexAmongCallerFlatFieldMetadatas = Math.max(
    computeCallerFlatFieldMetadatasForObject({
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    }).findIndex(
      (callerFlatFieldMetadata) =>
        callerFlatFieldMetadata.universalIdentifier ===
        sourceFlatFieldMetadata.universalIdentifier,
    ),
    0,
  );

  const createdAt = new Date().toISOString();

  return {
    universalIdentifier: getSystemViewFieldUniversalIdentifier({
      fieldMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      viewUniversalIdentifier: initialFlatView.universalIdentifier,
      fieldMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.universalIdentifier,
    }),
    applicationUniversalIdentifier,
    fieldMetadataUniversalIdentifier:
      sourceFlatFieldMetadata.universalIdentifier,
    viewUniversalIdentifier: initialFlatView.universalIdentifier,
    viewFieldGroupUniversalIdentifier: null,
    isVisible: true,
    size: DEFAULT_VIEW_FIELD_SIZE,
    position: appendBasePosition + indexAmongCallerFlatFieldMetadatas,
    aggregateOperation: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    isActive: true,
    isSystemSideEffect: true,
    isCanonical: true,
    universalOverrides: null,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };
};
