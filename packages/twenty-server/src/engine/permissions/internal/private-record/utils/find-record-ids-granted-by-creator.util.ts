/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolvePermissionsCreatorWorkspaceMemberId } from 'src/engine/permissions/internal/private-record/utils/resolve-permissions-creator-workspace-member-id.util';
import { resolvePrivateRecordState } from 'src/engine/permissions/internal/private-record/utils/resolve-private-record-state.util';

export const findRecordIdsGrantedByCreator = async ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): Promise<string[]> => {
  const workspaceMemberId = resolvePermissionsCreatorWorkspaceMemberId(request);

  if (!isDefined(workspaceMemberId) || records.length === 0) {
    return [];
  }

  const recordIds = records.map((record) => record.id);
  const privateRecordStates = await context.findPrivateRecordStates({
    objectMetadataId: request.flatObjectMetadata.id,
    recordIds,
  });

  return recordIds.filter((recordId) => {
    const { isPrivate, createdByWorkspaceMemberId } = resolvePrivateRecordState(
      { recordId, privateRecordStates },
    );

    return isPrivate && createdByWorkspaceMemberId === workspaceMemberId;
  });
};
