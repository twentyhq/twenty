import { computeSeededObjectViewFieldsToCreate } from 'src/engine/metadata-modules/view/utils/compute-seeded-object-view-fields-to-create.util';
import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/view/utils/compute-seeded-object-view-to-create.util';
import { fromArrayToUniqueKeyRecord } from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeSeededObjectViewOperationsOnObjectCreation = ({
  flatObjectMetadataToCreate,
  callerFlatFieldMetadatasToCreate,
}: {
  flatObjectMetadataToCreate: Pick<
    UniversalFlatObjectMetadata,
    | 'applicationUniversalIdentifier'
    | 'universalIdentifier'
    | 'labelPlural'
    | 'labelIdentifierFieldMetadataUniversalIdentifier'
  >;
  callerFlatFieldMetadatasToCreate: UniversalFlatFieldMetadata[];
}): {
  flatSeededViewToCreate: UniversalFlatView;
  flatSeededViewFieldsToCreate: UniversalFlatViewField[];
} => {
  const { applicationUniversalIdentifier } = flatObjectMetadataToCreate;

  const flatSeededViewToCreate = computeSeededObjectViewToCreate({
    objectMetadata: flatObjectMetadataToCreate,
    applicationUniversalIdentifier,
  });

  const flatSeededViewFieldsToCreate = computeSeededObjectViewFieldsToCreate({
    sourceFlatObjectMetadata: flatObjectMetadataToCreate,
    seededViewUniversalIdentifier: flatSeededViewToCreate.universalIdentifier,
    allFlatEntityOperationRecordByMetadataName: {
      fieldMetadata: {
        flatEntityToCreate: fromArrayToUniqueKeyRecord({
          array: callerFlatFieldMetadatasToCreate,
          uniqueKey: 'universalIdentifier',
        }),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    },
  });

  return { flatSeededViewToCreate, flatSeededViewFieldsToCreate };
};
