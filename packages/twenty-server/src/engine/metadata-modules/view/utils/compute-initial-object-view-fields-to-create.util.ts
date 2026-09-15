import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { buildInitialViewFieldFlatEntity } from 'src/engine/metadata-modules/view/utils/build-initial-view-field-flat-entity.util';
import { computeDefaultViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/compute-default-view-field-position-by-field-universal-identifier.util';
import { computeViewFieldPositionInputFlatFieldMetadatas } from 'src/engine/metadata-modules/view/utils/compute-view-field-position-input-flat-field-metadatas.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeInitialObjectViewFieldsToCreate = ({
  sourceFlatObjectMetadata,
  initialViewUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
}: {
  sourceFlatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    | 'applicationUniversalIdentifier'
    | 'universalIdentifier'
    | 'labelIdentifierFieldMetadataUniversalIdentifier'
  >;
  initialViewUniversalIdentifier: string;
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
    ([fieldMetadataUniversalIdentifier, position]) =>
      buildInitialViewFieldFlatEntity({
        applicationUniversalIdentifier,
        initialViewUniversalIdentifier,
        fieldMetadataUniversalIdentifier,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        position,
        aggregateOperation: null,
        isActive: true,
        createdAt,
      }),
  );
};
