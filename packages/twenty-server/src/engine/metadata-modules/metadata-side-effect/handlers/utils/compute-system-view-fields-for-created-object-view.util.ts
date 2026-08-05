import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import { computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-index-view-field-position-by-field-universal-identifier.util';
import { computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-record-page-view-field-position-by-field-universal-identifier.util';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeSystemViewFieldsForCreatedObjectView = ({
  sourceFlatObjectMetadata,
  viewUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
  labelIdentifierPolicy,
}: {
  sourceFlatObjectMetadata: UniversalFlatObjectMetadata;
  viewUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  labelIdentifierPolicy: 'displayedFirst' | 'excluded';
}): {
  systemFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  flatViewFieldsToCreate: UniversalFlatViewField[];
} => {
  const {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
  } = sourceFlatObjectMetadata;

  const systemFlatFieldMetadatas = Object.values(
    buildReservedSystemFlatFieldMetadatasForCustomObject({
      flatObjectMetadata: {
        applicationUniversalIdentifier,
        universalIdentifier: objectMetadataUniversalIdentifier,
      },
    }),
  );

  const callerFlatFieldMetadatas = computeCallerFlatFieldMetadatasForObject({
    objectMetadataUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
  });

  const computePositionByFieldUniversalIdentifier =
    labelIdentifierPolicy === 'displayedFirst'
      ? computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier
      : computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier;

  const positionByFieldUniversalIdentifier =
    computePositionByFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      callerFlatFieldMetadatas,
    });

  const flatViewFieldsToCreate = computeFlatViewFieldsToCreate({
    objectFlatFieldMetadatas: systemFlatFieldMetadatas,
    viewUniversalIdentifier,
    applicationUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    excludeLabelIdentifier: labelIdentifierPolicy === 'excluded',
  }).map((flatViewFieldToCreate) => ({
    ...flatViewFieldToCreate,
    position:
      positionByFieldUniversalIdentifier.get(
        flatViewFieldToCreate.fieldMetadataUniversalIdentifier,
      ) ?? flatViewFieldToCreate.position,
  }));

  return { systemFlatFieldMetadatas, flatViewFieldsToCreate };
};
