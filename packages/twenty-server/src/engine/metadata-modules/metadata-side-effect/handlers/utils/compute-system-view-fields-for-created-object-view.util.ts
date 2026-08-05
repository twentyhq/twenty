import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import {
  computeDefaultViewFieldPositionByFieldUniversalIdentifier,
  type ViewFieldLabelIdentifierPolicy,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-view-field-position-by-field-universal-identifier.util';
import { computeSystemViewFieldsToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-view-fields-to-create.util';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
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
  labelIdentifierPolicy: ViewFieldLabelIdentifierPolicy;
}): UniversalFlatViewField[] => {
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

  const positionByFieldUniversalIdentifier =
    computeDefaultViewFieldPositionByFieldUniversalIdentifier({
      systemFlatFieldMetadatas,
      callerFlatFieldMetadatas,
      labelIdentifierFieldMetadataUniversalIdentifier,
      labelIdentifierPolicy,
    });

  return computeSystemViewFieldsToCreate({
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
};
