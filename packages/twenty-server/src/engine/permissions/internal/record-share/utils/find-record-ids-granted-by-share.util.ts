/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRecordIdsByPrivacy } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-by-privacy.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/internal/record-share/utils/resolve-permissions-share-grant.util';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/permissions/internal/record-share/utils/resolve-record-ids-shared-with-principals.util';

export const findRecordIdsGrantedByShare = async ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): Promise<string[]> => {
  const shareGrant = resolvePermissionsShareGrant(request);

  if (!isDefined(shareGrant) || records.length === 0) {
    return [];
  }

  const recordIds = records.map((record) => record.id);
  const sharedRecordIds = resolveRecordIdsSharedWithPrincipals({
    recordShares: await context.fetchRecordShares({
      objectMetadataId: request.flatObjectMetadata.id,
      recordIds,
    }),
    principalIds: shareGrant.principalIds,
    accessLevels: shareGrant.accessLevels,
  });
  const shareGrantedRecordIds = recordIds.filter((recordId) =>
    sharedRecordIds.has(recordId),
  );

  return shareGrant.isLimitedToPrivateRecords
    ? findRecordIdsByPrivacy({
        recordIds: shareGrantedRecordIds,
        flatObjectMetadata: request.flatObjectMetadata,
        context,
        isPrivate: true,
      })
    : shareGrantedRecordIds;
};
