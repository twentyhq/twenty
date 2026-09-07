import { getViewFieldUniversalIdentifier } from 'twenty-shared/application';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { computeDefaultViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-view-field-position-by-field-universal-identifier.util';
import { computeViewFieldPositionInputFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-view-field-position-input-flat-field-metadatas.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeSeededObjectViewFieldsToCreate = ({
  sourceFlatObjectMetadata,
  seededViewUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
}: {
  sourceFlatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    | 'applicationUniversalIdentifier'
    | 'universalIdentifier'
    | 'labelIdentifierFieldMetadataUniversalIdentifier'
  >;
  seededViewUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
}): UniversalFlatViewField[] => {
  const {
    applicationUniversalIdentifier,
    universalIdentifier: objectMetadataUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
  } = sourceFlatObjectMetadata;

  const { systemFlatFieldMetadatas, callerFlatFieldMetadatas } =
    computeViewFieldPositionInputFlatFieldMetadatas({
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

  const positionByFieldUniversalIdentifier =
    computeDefaultViewFieldPositionByFieldUniversalIdentifier({
      systemFlatFieldMetadatas,
      callerFlatFieldMetadatas,
      labelIdentifierFieldMetadataUniversalIdentifier,
      labelIdentifierPolicy: 'displayedFirst',
    });

  const createdAt = new Date().toISOString();

  return [...positionByFieldUniversalIdentifier.entries()].map(
    ([fieldMetadataUniversalIdentifier, position]) => ({
      fieldMetadataUniversalIdentifier,
      viewUniversalIdentifier: seededViewUniversalIdentifier,
      viewFieldGroupUniversalIdentifier: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        viewUniversalIdentifier: seededViewUniversalIdentifier,
        fieldMetadataUniversalIdentifier,
      }),
      isVisible: true,
      size: DEFAULT_VIEW_FIELD_SIZE,
      position,
      aggregateOperation: null,
      isActive: true,
      isSystemSideEffect: false,
      universalOverrides: null,
      applicationUniversalIdentifier,
    }),
  );
};
