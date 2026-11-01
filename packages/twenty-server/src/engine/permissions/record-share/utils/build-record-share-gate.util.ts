/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import { buildPrivateRecordCreatorExpression } from 'src/engine/permissions/private-record/utils/build-private-record-creator-expression.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';
import {
  type RowAccessPolicy,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/permissions/combine/types/row-access-policy.type';

export const buildRecordShareGate = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
  operationType,
}: RowAccessPolicyContext &
  Pick<
    RowAccessPolicyTarget,
    'tableAlias' | 'flatObjectMetadata' | 'operationType'
  >): RowAccessPolicy => {
  if (
    !isPrivateRecordEnabled(environment.featureFlagsMap) ||
    isPermissionStorageObject(flatObjectMetadata) ||
    !isDefined(subject.principalIds)
  ) {
    return { kind: 'open' };
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (accessLevels.length === 0) {
    return { kind: 'open' };
  }

  const creator = buildPrivateRecordCreatorExpression({
    workspaceMemberId: subject.workspaceMemberId,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    tableAlias,
    flatObjectMetadata,
  });

  return {
    kind: 'gated',
    expression: {
      kind: 'or',
      operands: [
        {
          kind: 'recordPrivacy',
          isPrivate: false,
          tableAlias,
          objectMetadataId: flatObjectMetadata.id,
        },
        ...(isDefined(creator) ? [creator] : []),
        {
          kind: 'recordShared',
          tableAlias,
          objectMetadataId: flatObjectMetadata.id,
          principalIds: subject.principalIds,
          accessLevels,
        },
      ],
    },
  };
};
