/* @license Enterprise */

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolvePrivateRecordState } from 'src/engine/permissions/internal/private-record/utils/resolve-private-record-state.util';

export const findRecordIdsByPrivacy = async ({
  recordIds,
  flatObjectMetadata,
  context,
  isPrivate,
}: Pick<
  PermissionsRowAccessEvaluationRequest,
  'flatObjectMetadata' | 'context'
> & {
  recordIds: string[];
  isPrivate: boolean;
}): Promise<string[]> => {
  if (recordIds.length === 0) {
    return [];
  }

  const privateRecordStates = await context.findPrivateRecordStates({
    objectMetadataId: flatObjectMetadata.id,
    recordIds,
  });

  return recordIds.filter(
    (recordId) =>
      resolvePrivateRecordState({ recordId, privateRecordStates }).isPrivate ===
      isPrivate,
  );
};
