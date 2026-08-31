import { isFlatFieldMetadataEligibleForRecordForm } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';
import { orderFlatFieldMetadatasForSystemIndexView } from 'src/engine/metadata-modules/object-metadata/utils/order-flat-field-metadatas-for-system-index-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const computeRecordFormFlatFieldMetadatas = ({
  flatFieldMetadatas,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  flatFieldMetadatas: UniversalFlatFieldMetadata[];
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
}): UniversalFlatFieldMetadata[] =>
  orderFlatFieldMetadatasForSystemIndexView({
    labelIdentifierFieldMetadataUniversalIdentifier,
    flatFieldMetadatas: flatFieldMetadatas.filter(
      isFlatFieldMetadataEligibleForRecordForm,
    ),
  });
