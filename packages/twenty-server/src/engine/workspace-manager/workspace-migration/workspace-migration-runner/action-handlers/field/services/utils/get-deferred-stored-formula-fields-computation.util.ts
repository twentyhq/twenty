import { getFieldMetadataFormulaEvaluation } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

export const getDeferredStoredFormulaFieldsComputation = ({
  flatFieldMetadata,
}: {
  flatFieldMetadata: Pick<
    FlatFieldMetadata,
    'id' | 'objectMetadataId' | 'settings'
  >;
}):
  | {
      name: 'compute_storedFormulaFields';
      payload: DeferredWorkspaceOperationPayload<'compute_storedFormulaFields'>;
    }
  | undefined =>
  getFieldMetadataFormulaEvaluation({
    settings: flatFieldMetadata.settings,
  }) === 'STORED'
    ? {
        name: 'compute_storedFormulaFields' as const,
        payload: {
          objectMetadataId: flatFieldMetadata.objectMetadataId,
          formulaFieldMetadataIds: [flatFieldMetadata.id],
        },
      }
    : undefined;
