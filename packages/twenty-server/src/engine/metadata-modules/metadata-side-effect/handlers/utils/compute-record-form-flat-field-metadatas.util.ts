import {
  isFlatFieldMetadataEligibleForRecordForm,
  type RecordFormCandidateFlatFieldMetadata,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';
import { orderFlatFieldMetadatasForSystemIndexView } from 'src/engine/metadata-modules/object-metadata/utils/order-flat-field-metadatas-for-system-index-view.util';

export const computeRecordFormFlatFieldMetadatas = <
  TFlatFieldMetadata extends RecordFormCandidateFlatFieldMetadata,
>({
  flatFieldMetadatas,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  flatFieldMetadatas: TFlatFieldMetadata[];
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
}): TFlatFieldMetadata[] =>
  orderFlatFieldMetadatasForSystemIndexView({
    labelIdentifierFieldMetadataUniversalIdentifier,
    flatFieldMetadatas: flatFieldMetadatas.filter(
      isFlatFieldMetadataEligibleForRecordForm,
    ),
  });
