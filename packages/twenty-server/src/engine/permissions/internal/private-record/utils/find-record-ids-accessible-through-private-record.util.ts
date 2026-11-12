/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { resolvePrivateRecordCreatorWorkspaceMemberId } from 'src/engine/permissions/internal/private-record/utils/resolve-private-record-creator-workspace-member-id.util';
import { resolvePrivateRecordState } from 'src/engine/permissions/internal/private-record/utils/resolve-private-record-state.util';

export const findRecordIdsAccessibleThroughPrivateRecord = async ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): Promise<string[]> => {
  const workspaceMemberId =
    resolvePrivateRecordCreatorWorkspaceMemberId(request);

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
