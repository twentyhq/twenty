import { computeInitialObjectViewFieldsToCreate } from 'src/engine/metadata-modules/view/utils/compute-initial-object-view-fields-to-create.util';
import { computeInitialObjectViewToCreate } from 'src/engine/metadata-modules/view/utils/compute-initial-object-view-to-create.util';
import { fromArrayToUniqueKeyRecord } from 'twenty-shared/utils';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeInitialObjectViewOperationsOnObjectCreation = ({
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
  flatInitialViewToCreate: UniversalFlatView;
  flatInitialViewFieldsToCreate: UniversalFlatViewField[];
} => {
  const { applicationUniversalIdentifier } = flatObjectMetadataToCreate;

  const flatInitialViewToCreate = computeInitialObjectViewToCreate({
    objectMetadata: flatObjectMetadataToCreate,
    applicationUniversalIdentifier,
  });

  const flatInitialViewFieldsToCreate = computeInitialObjectViewFieldsToCreate({
    sourceFlatObjectMetadata: flatObjectMetadataToCreate,
    initialViewUniversalIdentifier: flatInitialViewToCreate.universalIdentifier,
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

  return { flatInitialViewToCreate, flatInitialViewFieldsToCreate };
};
