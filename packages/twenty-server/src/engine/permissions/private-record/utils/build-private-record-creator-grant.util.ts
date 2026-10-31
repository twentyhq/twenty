/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { buildPrivateRecordCreatorExpression } from 'src/engine/permissions/private-record/utils/build-private-record-creator-expression.util';
import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import { resolveObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/permissions/combine/types/row-access-policy.type';

export const buildPrivateRecordCreatorGrant = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
}: Pick<RowAccessPolicyContext, 'subject' | 'environment'> &
  Pick<RowAccessPolicyTarget, 'tableAlias' | 'flatObjectMetadata'>):
  | RowAccessExpression
  | undefined => {
  const { isShareRequired } = resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
  });

  if (isShareRequired || !isPrivateRecordEnabled(environment.featureFlagsMap)) {
    return undefined;
  }

  const creator = buildPrivateRecordCreatorExpression({
    workspaceMemberId: subject.workspaceMemberId,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    tableAlias,
    flatObjectMetadata,
  });

  if (!isDefined(creator)) {
    return undefined;
  }

  return {
    kind: 'and',
    operands: [
      {
        kind: 'recordPrivacy',
        isPrivate: true,
        tableAlias,
        objectMetadataId: flatObjectMetadata.id,
      },
      creator,
    ],
  };
};
