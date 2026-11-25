/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { resolveRecordShareAccessRequirement } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-access-requirement.util';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/permissions/internal/record-share/utils/resolve-record-ids-shared-with-principals.util';

export const findRecordIdsAccessibleThroughRecordShare = async ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): Promise<string[]> => {
  const recordShareAccessRequirement =
    resolveRecordShareAccessRequirement(request);

  if (!isDefined(recordShareAccessRequirement) || records.length === 0) {
    return [];
  }

  const recordIds = records.map((record) => record.id);
  const sharedRecordIds = resolveRecordIdsSharedWithPrincipals({
    recordShares: await context.fetchRecordShares({
      objectMetadataId: request.flatObjectMetadata.id,
      recordIds,
    }),
    principalIds: recordShareAccessRequirement.principalIds,
    accessLevels: recordShareAccessRequirement.accessLevels,
  });
  return recordIds.filter((recordId) => sharedRecordIds.has(recordId));
};
