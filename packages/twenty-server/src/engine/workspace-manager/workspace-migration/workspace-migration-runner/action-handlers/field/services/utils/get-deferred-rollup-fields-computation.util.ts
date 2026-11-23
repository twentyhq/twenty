import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export const getDeferredRollupFieldsComputation = ({
  flatFieldMetadata,
}: {
  flatFieldMetadata: Pick<
    FlatFieldMetadata,
    'id' | 'type' | 'objectMetadataId'
  >;
}):
  | {
      name: 'compute_rollupFields';
      payload: DeferredWorkspaceOperationPayload<'compute_rollupFields'>;
    }
  | undefined =>
  flatFieldMetadata.type === FieldMetadataType.ROLLUP
    ? {
        name: 'compute_rollupFields' as const,
        payload: {
          objectMetadataId: flatFieldMetadata.objectMetadataId,
          rollupFieldMetadataIds: [flatFieldMetadata.id],
        },
      }
    : undefined;
